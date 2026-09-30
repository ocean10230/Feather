import { pcall, sleep } from "@/helpers/utility"
import { FetchPage, RSC, ParseSearchComponent, Bing } from "@/helpers/parser"
import { TaskResponse } from "@/task"
import { log } from "@/helpers/debugging"

const GetBatchQuery = async (): Promise<string> => {
  try {
    const res = await curl("https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&grnlimit=1&format=json&origin=*")
    const data = await res.json()
    const pages = Object.values(data.query.pages)
    return (pages[0] as any)?.title
  } catch {
    return "youtube"
  }
}

let cached_cvid = ""

const reportSearch = async (q: string) => {
    log.searches(`Reporting search "${q}"`)
    const SID = await chrome.cookies.get({
        name: "_SS",
        url: Bing
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

    curl(`https://vcf.bing.com/bd/verify?IID=BdVerify&SFX=1&IG=${IG}`, {
        headers: { "accept": "*/*", "priority": "u=1, i" },
        referrer: Bing,
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
    const pageDat = await FetchPage()
    const parsedData = await RSC(pageDat, `\"type\":\"pointbreakdown\"`)
    const counter: SearchInfo = parsedData?.model?.pointsCounters?.pc

    if (!counter || counter.progress >= counter.max) {
        log.searches("Search completed")
        return true
    }

    log.searches(`Progress: ${counter.progress}/${counter.max}`)

    for (let i = counter.progress / 3; i > counter.max / 3; i++) {
        const query = await GetBatchQuery()
        pcall(async () => await reportSearch(query))
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