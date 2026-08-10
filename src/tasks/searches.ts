import { log, randomHex, sleep } from "@/internal"
import { GetSearches, Storage, StorageKeys } from "@/rewards/utility"
import { FetchPage, RSC, ParseSearchComponent, ParseReport, Bing } from "@/rewards/component"
import { TaskResponse } from "@/task"

let cached: string[] = []

// --- HUMAN TYPO & VARIANT GENERATION ---
const GenerateTypo = (query: string, chance = 0.10): string => {
  if (Math.random() > chance || query.length < 6) return query

  const words = query.split(" ")
  if (words.length < 2) return query

  const mode = Math.random()

  if (mode < 0.40) {
    const spaceIdx = Math.floor(Math.random() * (words.length - 1))
    words[spaceIdx] = words[spaceIdx] + words[spaceIdx + 1]
    words.splice(spaceIdx + 1, 1)
    return words.join(" ")
  }

  if (mode < 0.70) {
    const spaceIdx = Math.floor(Math.random() * (words.length - 1))
    const targetWord = words[spaceIdx + 1]

    if (targetWord.length > 2) {
      words[spaceIdx] = words[spaceIdx] + targetWord[0]
      words[spaceIdx + 1] = targetWord.slice(1)
      return words.join(" ")
    }
  }

  const targetWordIdx = Math.floor(Math.random() * words.length)
  const wordChars = words[targetWordIdx].split("")

  if (wordChars.length >= 4) {
    const charIdx = Math.floor(Math.random() * (wordChars.length - 3)) + 1;
    [wordChars[charIdx], wordChars[charIdx + 1]] = [wordChars[charIdx + 1], wordChars[charIdx]]
    words[targetWordIdx] = wordChars.join("")
  }

  return words.join(" ")
}

const toTitleCase = (str: string): string =>
  str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

const toUpperCase = (str: string): string => str.toUpperCase()

const applyVariantDistribution = (queries: string[]): string[] => {
  return queries.map(query => {
    const roll = Math.random()

    if (roll < 0.20) return toTitleCase(query)
    if (roll < 0.25) return toUpperCase(query)
    if (roll < 0.35) return GenerateTypo(toUpperCase(query))
    if (roll < 0.40) return GenerateTypo(query)

    return query
  })
}

// --- SEARCH REPORTING ---
const reportSearch = async (q: string, fetch_prom: Promise<Response>) => {
  log.searches(`Reporting search "${q}" to Microsoft's API for points`)

  const text = await (await fetch_prom).text()
  const components = ParseSearchComponent(text)

  const IG = components.IG
  const IID = components.IID

  const rdr = Math.floor(Math.random() * 10) + 1
  const rdrig = randomHex(32)
  const cvid = randomHex(32).toUpperCase()

  const queryParams = new URLSearchParams({
    IG, IID,
    q, form: "QBLH",
    sp: "-1", ghc: "1", lq: "0",
    pq: q, sc: "1-9", qs: "n",
    sk: "", cvid, rdr: `${rdr}`,
    rdrig, ajaxreq: "1",
  })

  const fullSearchUrl = `${Bing}/search?${queryParams.toString()}`
  const endpoint = `${Bing}/rewardsapp/reportActivity?${queryParams.toString()}`

  const body = new URLSearchParams({
    url: fullSearchUrl, V: "web",
  })

  return await fetch(endpoint, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      "accept": "*/*", "ect": "4g", "priority": "u=1, i",
      "content-type": "application/x-www-form-urlencoded"
    },
    referrer: fullSearchUrl,
    body: body.toString(),
  })
}

const IsCompleted = (counter?: SearchInfo) => Boolean(counter && counter.progress >= counter.max)

// --- CORE SEARCH LOOP ---
const ExecutePhase = async (
  counter: SearchInfo
): Promise<boolean> => {
  if (IsCompleted(counter)) {
    log.searches(`Already completed for today (${counter.progress}/${counter.max}).`)
    return true
  }

  if (cached.length < 1) cached = GetSearches()
  if (!cached || cached.length === 0) {
    log.searches(`No queries available in cached list.`)
    return false
  }

  const raw_queries = cached.sort(() => 0.5 - Math.random()).slice(0, 150)
  const queries = applyVariantDistribution(raw_queries)

  let searchesDone = counter.progress ?? 0
  const maxSearches = counter.max ?? 60

  log.searches(`Starting search loop... Initial progress: ${searchesDone}/${maxSearches}`)

  for (const query of queries) {
    if (searchesDone >= maxSearches) break

    try {
      const report = await reportSearch(
        query,
        fetch(`${Bing}/search?q=${encodeURIComponent(query)}`)
      )
      const parsed = ParseReport(await report.text())

      if (!parsed.Failed && parsed.RewardsSessionData) {
        searchesDone =
          parsed.RewardsSessionData.DailySearchPointsEarned ??
          searchesDone + (parsed.RewardsIncrement || 3)
      } else {
        searchesDone += 3
      }
    } catch (e) {
      log.searches(`Failed to search query "${query}":`, e)
    }

    await sleep(8000 + Math.random() * 3500)
  }

  log.searches(`Phase finished with status: ${searchesDone}/${maxSearches}`)
  return searchesDone >= maxSearches
}

// --- ENTRY POINT ---
export default async (): Promise<TaskResponse> => {
  try {
    const pageDat = await FetchPage()
    const parsedData = await RSC(pageDat, `\"type\":\"pointbreakdown\"`)

    if (!parsedData?.model?.pointsCounters) {
      log.searches("Could not parse points counters from page response.")
      return TaskResponse.UnknownError
    }

    const { pc } = parsedData.model.pointsCounters
    if (!IsCompleted(pc)) await ExecutePhase(pc)

    await Storage.set(StorageKeys.SearchCompletion, true)

    return TaskResponse.Done
  } catch (e) {
    log.error("Failed in default search task execution:", e)
    return TaskResponse.UnknownError
  }
}