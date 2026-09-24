import { sleep } from "@/internal/util"
import { FetchPage, RSC, ParseSearchComponent, ParseReport, Bing } from "@/rewards/parser"
import { TaskResponse } from "@/internal/task"
import { log } from "shared/log"
import { socialMedias } from "@/rewards/search"

const GetBatchQueries = async (): Promise<string[]> => {
  try {
    const res = await fetch("https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=30&format=json&origin=*")
    const data = await res.json()
    return Object.values(data.query.pages).map((p: any) => p.title.toLowerCase())
  } catch {
    return socialMedias
  }
}

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

const ExecutePhase = async (
  counter: SearchInfo
): Promise<boolean> => {
  if (IsCompleted(counter)) {
    log.searches("Search completed")
    return true
  }
  
  let searchesDone = counter.progress ?? 0
  const maxSearches = counter.max ?? 60
  const queries = await GetBatchQueries()

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