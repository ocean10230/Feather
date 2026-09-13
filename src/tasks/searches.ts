import { sleep } from "@/internal/util"
import { GetSearches} from "@/rewards/utility"
import { FetchPage, RSC, ParseSearchComponent, ParseReport, Bing } from "@/rewards/parser"
import { TaskResponse } from "@/internal/task"
import { log } from "shared/log"

let cached: string[] = []

const reportSearch = async (q: string, fetch_prom: Promise<Response>) => {
  log.searches(`Reporting search "${q}"`)

  const text = await (await fetch_prom).text()
  const components = ParseSearchComponent(text)
  const {IG, IID} = components

  const queryParams = new URLSearchParams({
    IG, IID, q, pq: q, form: "QBLH",
    cvid: "ED96545512E0492DAE488BD5B3118DFA"
  })

  const fullSearchUrl = `${Bing}/search?${queryParams.toString()}`

  return await curl(`${Bing}/rewardsapp/reportActivity?${queryParams.toString()}`, {
    method: "POST", mode: "cors",
    credentials: "include",
    headers: { accept: "*/*", ect: "4g", priority: "u=1, i", "content-type": "application/x-www-form-urlencoded", },
    referrer: fullSearchUrl,
    body: new URLSearchParams({ url: fullSearchUrl, V: "web" }).toString(),
  })
}

const IsCompleted = (counter?: SearchInfo) => Boolean(counter && counter.progress >= counter.max)

// --- CORE SEARCH LOOP ---

const ExecutePhase = async (
  counter: SearchInfo
): Promise<boolean> => {
  if (IsCompleted(counter)) {
    log.searches("Search completed")
    return true
  }

  if (cached.length < 1) cached = GetSearches()
  if (!cached || cached.length === 0) return false
  
  let searchesDone = counter.progress ?? 0
  const maxSearches = counter.max ?? 60
  const queries = cached.sort(() => 0.5 - math.random()).slice(0, 120)

  log.searches(`Progress: ${searchesDone}/${maxSearches}`)

  for (const query of queries) {
    if (searchesDone >= maxSearches) break

    try {
      const parsed = ParseReport(await (await reportSearch(
        query,
        curl(`${Bing}/search?q=${encodeURIComponent(query)}`)
      )).text())

      if (!parsed.Failed && parsed.RewardsSessionData) searchesDone = parsed.RewardsSessionData.DailySearchPointsEarned ?? searchesDone + (parsed.RewardsIncrement || 3)
      else searchesDone += 3
    } catch (e) {
      log.searches(`Failed to search "${query}":`, e)
    }

    await sleep(9000 + math.random() * 3500)
  }

  log.searches(`Finished: ${searchesDone}/${maxSearches}`)
  return searchesDone >= maxSearches
}

// --- ENTRY POINT ---
export default async (): Promise<TaskResponse> => {
  try {
    const pageDat = await FetchPage()
    const parsedData = await RSC(pageDat, `\"type\":\"pointbreakdown\"`)

    if (!parsedData?.model?.pointsCounters) {
      log.searches("Could not parse points")
      return TaskResponse.UnknownError
    }

    const { pc } = parsedData.model.pointsCounters
    if (!IsCompleted(pc)) await ExecutePhase(pc)

    return TaskResponse.Done
  } catch (e) {
    log.error("Failed searching:", e)
    return TaskResponse.UnknownError
  }
}