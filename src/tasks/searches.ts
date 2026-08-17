import { log, sleep } from "@/internal"
import { GetSearches, Storage, StorageKeys } from "@/rewards/utility"
import { FetchPage, RSC, ParseSearchComponent, ParseReport, Bing } from "@/rewards/component"
import { TaskResponse } from "@/task"

let cached: string[] = []

const reportSearch = async (q: string, fetch_prom: Promise<Response>) => {
  log.searches(`Reporting search "${q}" to Microsoft's API for points`)

  const text = await (await fetch_prom).text()
  const components = ParseSearchComponent(text)

  const IG = components.IG
  const IID = components.IID

  const queryParams = new URLSearchParams({
    IG, IID, q, form: "QBLH", pq: q,
    cvid: "ED96545512E0492DAE488BD5B3118DFA"
  })

  const fullSearchUrl = `${Bing}/search?${queryParams.toString()}`

  return await fetch(`${Bing}/rewardsapp/reportActivity?${queryParams.toString()}`, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: {
      accept: "*/*", ect: "4g", priority: "u=1, i",
      "content-type": "application/x-www-form-urlencoded",
    },
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
    log.searches(`Already completed for today (${counter.progress}/${counter.max}).`)
    return true
  }

  if (cached.length < 1) cached = GetSearches()
  if (!cached || cached.length === 0) {
    log.searches(`No queries available in cached list.`)
    return false
  }

  const queries = cached.sort(() => 0.5 - Math.random()).slice(0, 150)

  let searchesDone = counter.progress ?? 0
  const maxSearches = counter.max ?? 60

  log.searches(`Starting search loop... Initial progress: ${searchesDone}/${maxSearches}`)

  for (const query of queries) {
    if (searchesDone >= maxSearches) break

    /**/

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

    await sleep(9000 + Math.random() * 3500)
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