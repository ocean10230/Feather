import { has_tag, log, randomHex, sleep } from "@/expand";
import { ParseSearchComponent } from "@/rewards/component";
import { GetSearches, Storage, StorageKeys } from "@/rewards/utility"
import { TaskResponse } from "@/task"

let cached: string[] = []

const addNaturalHumanTypo = (query: string, chance = 0.10): string => {
  if (Math.random() > chance || query.length < 6) return query;

  const words = query.split(" ");
  if (words.length < 2) return query;

  const mode = Math.random();

  // Mode 1: Missed Space / Fused Words (e.g., "how todownload") - 40% chance
  if (mode < 0.40) {
    const spaceIdx = Math.floor(Math.random() * (words.length - 1));
    words[spaceIdx] = words[spaceIdx] + words[spaceIdx + 1];
    words.splice(spaceIdx + 1, 1);
    return words.join(" ");
  }

  // Mode 2: Delayed Space Hit (e.g., "how tod ownload") - 30% chance
  if (mode < 0.70) {
    const spaceIdx = Math.floor(Math.random() * (words.length - 1));
    const targetWord = words[spaceIdx + 1];
    
    if (targetWord.length > 2) {
      words[spaceIdx] = words[spaceIdx] + targetWord[0];
      words[spaceIdx + 1] = targetWord.slice(1);
      return words.join(" ");
    }
  }

  // Mode 3: In-Word Letter Swap (e.g., "downlaod") - 30% chance
  const targetWordIdx = Math.floor(Math.random() * words.length);
  const wordChars = words[targetWordIdx].split("");

  if (wordChars.length >= 4) {
    const charIdx = Math.floor(Math.random() * (wordChars.length - 3)) + 1;
    [wordChars[charIdx], wordChars[charIdx + 1]] = [wordChars[charIdx + 1], wordChars[charIdx]];
    words[targetWordIdx] = wordChars.join("");
  }

  return words.join(" ");
};

const toTitleCase = (str: string): string =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

const toUpperCase = (str: string): string => str.toUpperCase()

const applyVariantDistribution = (queries: string[]): string[] => {
  return queries.map(query => {
    const roll = Math.random()

    if (roll < 0.20)
      return toTitleCase(query)
    else if (roll < 0.25)
      return toUpperCase(query)
    else if (roll < 0.35)
      return addNaturalHumanTypo(toUpperCase(query))
    else if (roll < 0.40)
      return addNaturalHumanTypo(query)
    
    return query
  })
}

const reportSearch = async (query: string, fetch_prom: Promise<Response>) => {
  log.activities(`Reporting search "${query}" to Microsoft's API for points`)

  const text = await (await fetch_prom).text()
  const components = ParseSearchComponent(text)

  const IG =  components.IG
  const IID = components.IID

  const rdr = Math.floor(Math.random() * 10) + 1
  const rdrig = randomHex(32)

  const url = "https://www.bing.com/rewardsapp/reportActivity"
  const params = new URLSearchParams({ IG, IID, q: query, FORM: "HDRSC1", rdr: `${rdr}`, rdrig, ajaxreq: "1" })
  const body = new URLSearchParams({ url: `https://www.bing.com/search?q=${encodeURIComponent(query)}&FORM=HDRSC1&rdr=${rdr}&rdrig=${rdrig}`, V: "web" })

  return await fetch(`${url}?${params}`, {
    method: "POST", body, credentials: "include",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*" }
  })
}

export const ParseReport = (response: string): ReportStatus => {
  try { return JSON.parse(response.split("ReportActivity(")[1].split(")")[0]) }
  catch (e) {
    log.pc_search("Failed to parse report from server. Error:", e)
    return { Failed: true } as ReportStatus
  }
}

const GetCurrentState = async (query: string): Promise<ReportStatus> => {
  const reportResponse = await reportSearch(query, fetch(`https://bing.com/search?q=${encodeURIComponent(query)}`))

  return ParseReport(await reportResponse.text())
}

export default async (): Promise<TaskResponse> => {
  if (has_tag("ignore_pc_search")) {
    await Storage.set(StorageKeys.SearchCompletion, true)
    return TaskResponse.Confirm
  }

  const completed = await Storage.get(StorageKeys.SearchCompletion)
  if (completed === true) return TaskResponse.Confirm

  try {
    if (cached.length < 1) cached = GetSearches()
    
    // Pick 150 random queries and apply human variants
    const raw_queries = cached.sort(() => 0.5 - Math.random()).slice(0, 150)
    const queries = applyVariantDistribution(raw_queries)
    
    // Safely pick a random index without out-of-bounds error
    const randomIndex = Math.floor(Math.random() * queries.length)
    const CurrentState = await GetCurrentState(queries[randomIndex])

    if (CurrentState.Failed || !CurrentState.RewardsSessionData) {
      log.pc_search("Could not initialize initial rewards state.")
      return TaskResponse.UnknownError
    }

    log.pc_search("Queries list length:", queries.length, "items")

    let searchesDone = CurrentState.RewardsSessionData.DailySearchPointsEarned ?? 0
    const maxSearches = 90

    if (searchesDone >= maxSearches) {
      log.pc_search("Searches already completed for today. Marking as complete.")
      await Storage.set(StorageKeys.SearchCompletion, true)
      return TaskResponse.Confirm
    }

    log.pc_search("Current search progress:", `${searchesDone}/${maxSearches}`)

    for (const query of queries) {
      if (searchesDone >= maxSearches) break

      try {
        const report = await reportSearch(query, fetch(`https://bing.com/search?q=${encodeURIComponent(query)}`))
        const parsed = ParseReport(await report.text());
        
        // Safely extract points earned or fallback to default increment (+3)
        if (!parsed.Failed && parsed.RewardsSessionData)
          searchesDone = parsed.RewardsSessionData.DailySearchPointsEarned ?? (searchesDone + (parsed.RewardsIncrement || 3));
        else
          searchesDone += 3; // Safe default increment on parse failure
      }
      catch (e) { 
        log.pc_search("Failed to search:", e) 
      }

      await sleep(7000 + Math.random() * 3500)
    }
  }
  catch (e) {
    log.pc_search("Unknown error:", e)
    return TaskResponse.UnknownError
  }

  log.pc_search("Done. Awaiting confirmation")
  return TaskResponse.Done
}