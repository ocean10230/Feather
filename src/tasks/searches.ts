import { sleep } from "@/internal/util"
import { FetchPage, RSC, ParseSearchComponent, Bing } from "@/rewards/parser"
import { TaskResponse } from "@/internal/task"
import { log } from "shared/log"
import { socialMedias } from "@/rewards/search"

const GetBatchQuery = async (): Promise<string> => {
  try {
    const res = await fetch("https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=1&format=json&origin=*")
    const data = await res.json()
    const pages = Object.values(data.query.pages)
    return (pages[0] as any)?.title || socialMedias[0]
  } catch {
    return socialMedias[Math.floor(Math.random() * socialMedias.length)]
  }
}

let cached_cvid = ""

const reportSearch = async (q: string) => {
    log.searches(`Reporting search "${q}"`)
    const SID = await chrome.cookies.get({
        name: "_SS",
        url: "https://www.bing.com"
    })

    const searchRes = await curl(`${Bing}/search?q=${encodeURIComponent(q)}&cvid=${cached_cvid}&SID=${SID}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        }
    })

    const text = await searchRes.text()
    const { IG, IID, cvid } = ParseSearchComponent(text)
    cached_cvid = cvid

    if (!IG || !IID) {
        log.searches(`Warning: Failed to parse search components for "${q}".`)
        return null
    }

    fetch(`https://vcf.bing.com/bd/verify?IID=BdVerify&SFX=1&IG=${IG}`, {
        headers: { "accept": "*/*", "priority": "u=1, i" },
        referrer: "https://www.bing.com/",
        method: "GET",
        mode: "cors",
        credentials: "omit"
    })

    const queryParams = new URLSearchParams({
        IG, IID, q, form: "QBRE",
        sp: "-1", lq: "0", pq: q[0] || "y", 
        sc: "12-" + q.length, qs: "n", sk: "",
        cvid: cvid || "", 
        ajaxreq: "1"
    })

    const fullSearchUrl = `${Bing}/search?${queryParams.toString()}`

    return await curl(`${Bing}/rewardsapp/reportActivity?${queryParams.toString()}`, {
        method: "POST", 
        mode: "cors",
        credentials: "include",
        headers: { 
            accept: "*/*", 
            ect: "4g", 
            priority: "u=1, i", 
            "content-type": "application/x-www-form-urlencoded" 
        },
        referrer: fullSearchUrl,
        body: new URLSearchParams({ url: fullSearchUrl, V: "web" }).toString(),
    })
}

const ExecutePhase = async (): Promise<boolean> => {
    // Re-fetch dashboard state on every recursive hop to get real-time point counters
    const pageDat = await FetchPage()
    const parsedData = await RSC(pageDat, `\"type\":\"pointbreakdown\"`)
    const counter = parsedData?.model?.pointsCounters?.pc

    if (!counter || counter.progress >= counter.max) {
        log.searches("Search completed or counter unavailable")
        return true
    }

    log.searches(`Progress: ${counter.progress}/${counter.max}`)

    const query = await GetBatchQuery()
    try {
        await reportSearch(query)
    } catch (e) {
        log.searches(`Failed to search "${query}":`, e)
    }

    await sleep(9000 + Math.random() * 3500)
    return await ExecutePhase()
}

// --- ENTRY POINT ---
export default async (): Promise<TaskResponse> => {
    try {
        await ExecutePhase()
        return TaskResponse.Done
    } catch (e) {
        return TaskResponse.UnknownError
    }
}