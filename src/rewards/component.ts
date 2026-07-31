import { pcall, Storage, StorageKeys } from "./utility.ts"
import { log,  sleep } from "../expand.ts"
import { ScriptList } from "./utility.ts"

// parse the stupid shit
export const parseData = async (data?: string, keyword?: string): Promise<any | null> => {
  const [res, suc] = await pcall(() => {
    if (!data || !keyword) return

    // spot the one that stands out
    const list = data.split("\n")
    const breakdown = list.find((e: string) => e.includes(keyword))
    if (!breakdown) return null

    // parse and format data with the help of regret(c)
    const regex = /(?<=\b[0-9]+[a-z]?:)\[[\s\S]*\]/
    const match = breakdown.match(regex)

    if (!match) return null
    let json: string = match[0].replace(/"\$undefined"/g, "null")

    try {
        const parsed = JSON.parse(json)
        return parsed?.[3] ?? null
    } catch (e) {
        console.warn("Parse failed:", e)
        return match[0]
    }
  })

  if (suc) return res
  else console.error('Failed to parse NextJS flight data:', res)
}

/*

export const parseRouterTree = (data: NextFlightData) => {
    const list = data.split("\n");

    for (const line of list) {
        if (!line.startsWith("0:")) continue;

        try {
            const json = JSON.parse(
                line
                .replace(/^0:/, "")
                .replace(/"\$undefined"/g, "null")
            );

            const tree = json?.f?.[0]?.[0];

            if (tree)
                return tree;
            
        } catch {}
    }

    return null;
};

*/

///

const Cached: Record<string, NextFlightData> = {}

export const FetchPage = async (page: string = "https://rewards.bing.com/earn"): Promise<NextFlightData> => {
    try {
        if (Cached[page]) return Cached[page]
        else Cached[page] = ScriptList( await (await fetch(page)).text() )
        return Cached[page];
    }
    catch (e) {
        console.error("Failed to fetch page:", e)
        return "00:empty"
    }
}

const parseWebpackChunks = (source: string) => {
    const result: Record<string, string> = {}
    const specialRegex = /(\d+)\s*===\s*e\s*\?\s*"([^"]+)"/g
    let match

    while ((match = specialRegex.exec(source)) !== null) result[match[1]] = match[2]
    const objectRegex = /(\d+)\s*:\s*"([a-f0-9]+)"/g;

    while ((match = objectRegex.exec(source)) !== null) {
        const id = match[1];
        const hash = match[2];
        result[id] = `${id}.${hash}.js`
    }

    return result;
}

export const InitializeWebpackBundleList = async (doc: string, deployment_id: string) => {
    if (await Storage.get(StorageKeys.WebpackVersion) !== deployment_id) {
        await Storage.set(StorageKeys.WebpackVersion, deployment_id)
        await Storage.set(StorageKeys.WebpackBundleCache, "")
    }

    const found = doc.match(/<script\b[^>]*\bsrc=["'][^"']*\/_next\/static\/chunks\/webpack-[^"']+["'][^>]*>/i);
    if (!found) return

    const scriptUrl = found[0].match(/src=["']([^"']+)["']/i)?.[1];
    if (!scriptUrl) return

    await sleep(50)

    const scriptResponse = await fetch(`https://rewards.bing.com${scriptUrl}`);
    const scriptText = await scriptResponse.text();
    const chunks = parseWebpackChunks(scriptText);

    const chunk_list: Record<string,string> = {}

    for (const chunk of Object.values(chunks)) {
        const chunkUrl = `https://rewards.bing.com/_next/static/chunks/${chunk}?dpl=${deployment_id}`
        const chunkResponse = await fetch(chunkUrl) 
        chunk_list[chunk] = await chunkResponse.text();
    }

    await Storage.set(StorageKeys.WebpackBundleCache, JSON.stringify(chunk_list))
}

export const ParseActionId = async (
    doc: string, deployment_id: string, 
    action_name: string, keywords: string | string[]
): Promise<string | "NOT_FOUND" | undefined> => {
    const key = action_name + "_" + "ACTION"

    if (deployment_id == await Storage.get(StorageKeys.DeploymentId)) {
        const v = await Storage.get(key)
        if (v) return v as string
    }
    
    await InitializeWebpackBundleList(doc, deployment_id)
    const chunk_list = await Storage.get(StorageKeys.WebpackBundleCache) as string
    const chunks = JSON.parse(chunk_list)

    const res_list = await Promise.all( Object.keys(chunks).map(chunk_data => fetch(`https://rewards.bing.com/_next/static/chunks/${chunk_data}?dpl=${deployment_id}`)) )
    const parsed_webpack_bundle = await Promise.all( res_list.map(promise => promise.text()) )

    const parses_action_id = (script: string): string | "Unknown" => {
        const match = script.match(/createServerReference\)\(["']([^"']+)["']/)
        return match ? match[1] : "Unknown"
    }

    const process_id = async (bundle_js: string) => {
        const parsed = parses_action_id(bundle_js)
        await Storage.set(key, parsed)
        if (parsed == "Unknown") log.activities("Failed to parse action id of", action_name)
        return parsed
    }

    for (const webpack_bundle of parsed_webpack_bundle) {
        if (!webpack_bundle.includes(`createServerReference)("`)) continue

        if (Array.isArray(keywords)) {
            for (const keyword of keywords)
                if (webpack_bundle.includes(keyword))
                    return await process_id(webpack_bundle)
        }
        else if (webpack_bundle.includes(keywords))
            return await process_id(webpack_bundle)
    }

    return "NOT_FOUND"
}

export const RefreshSession = async () => {
    log.initlialize("Initializing extension session...")

    const url = "https://rewards.bing.com/dashboard"
    const rewardTab = await chrome.tabs.create({ url, active: false })
    
    if (!rewardTab.id) return
    log.tab("Opening Microsoft Rewards tab to handle auth redirect...")

    await sleep(1500)
    const currentTab = await chrome.tabs.get(rewardTab.id).catch(() => null)

    if (currentTab?.url === url) {
        log.tab("Session already valid!")
        try { await chrome.tabs.remove(rewardTab.id) } catch {}
        return
    }

    await new Promise<void>((resolve) => {
        const listener = async (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
            if (tabId === rewardTab.id && changeInfo.status === "complete" && tab.url === url) {
                log.tab("Microsoft Rewards page loaded, session refreshed!")
                chrome.tabs.onUpdated.removeListener(listener)
                resolve()
            }
        }

        try { chrome.tabs.onUpdated.addListener(listener) } catch {}
    })


    try {await chrome.tabs.remove(rewardTab.id).catch(() => {})} catch {}
}

export const RouterTree = "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22earn%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D"