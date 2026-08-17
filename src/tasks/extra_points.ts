import { ScriptList, StorageKeys, Storage } from "@/rewards/utility"
import { Dashboard, RSC, RouterTree } from "@/rewards/component"
import { TaskResponse } from "@/task"
import { log } from "@/internal"

const GetActionID = async (dpl: string) => {
    if ((await Storage.get(StorageKeys.ClaimPointsVersion)) as string == dpl) return await Storage.get(StorageKeys.ClaimPointsNextActionId) as string

    const seen = new Map()
    let returner = "not_found"

    const fetchScript = async (url: string) => {
        if (seen.has(url)) return
        if (!url.includes("?dpl=")) return

        try {
            const response = await fetch(url)

            if (!response.ok) {
                console.warn(`Failed to fetch ${url}: ${response.status}`)
                return
            }

            const text = await response.text()
            seen.set(url, text)

            for (const match of text.matchAll(
                /(?:["'`])((?:\.\.?\/|\/)?[^"'`\s]+\.js(?:[?#][^"'`\s]*)?)(?:["'`])/gi
            )) {
                const childPath = match[1]
                const childUrl = new URL(childPath, url).href
                await fetchScript(childUrl)
            }
        } catch (err) {
            console.warn(`Failed to fetch ${url}`, err)
        }
    }

    for (const match of document.documentElement.innerHTML.matchAll(
        /<script\b[^>]*\bsrc\s*=\s*["']([^"']+\.js(?:[?#][^"']*)?)["']/gi
    )) {
        const src = match[1]
        const url = new URL(src, location.href).href
        await fetchScript(url)
    }

    seen.forEach((content) => {
        if (content.includes("createServerReference") && content.toLowerCase().includes("claimallpoints"))
        returner = content as string
    })

    Storage.set(StorageKeys.ClaimPointsNextActionId, returner)

    return returner
}

export default async (): Promise<TaskResponse> => {
    log.points("Fetching dashboard's raw HTML")

    const fetched = await fetch(Dashboard)
    const pageData = await fetched.text()

    if (!pageData) return TaskResponse.ParseFailure
    log.points("Parsing available points...")

    let parsedHtml: NextFlightData = "00:empty"
    try { parsedHtml = ScriptList(pageData) } catch {}
    if (parsedHtml == "00:empty") return TaskResponse.ParseFailure

    const parsed_modal = await RSC(parsedHtml, `DashboardHeader_ClaimablePoints`)
    const parsed_button = parsed_modal?.children?.[0]?.[3]
    const parsed_points = parsed_button?.instrument?.data.points as number
    const clickable = parsed_button?.instrument?.click as boolean

    log.points("Parsed points:", parsed_points, "Claimable:", clickable)

    if (clickable && parsed_points > 0) {
      log.points("Getting required paramenters...")
      const dpl = await Storage.get(StorageKeys.DeploymentId) as string | None
      
      if (!dpl) {
        log.points("Failed to parse deployment ID, aborting...")
        return TaskResponse.ParseFailure
      }

      const claim_action_id = await GetActionID(dpl) 
      
      if (!claim_action_id || claim_action_id === "Unknown") {
        log.points("Failed to parse claim action ID, aborting...")
        return TaskResponse.ParseFailure
      }

      log.points("Claiming unclaimed", parsed_points, " points...")

      const claimResponse = await fetch(Dashboard, {
        "headers": {
          "accept": "text/x-component", "content-type": "text/plain;charset=UTF-8",
          "next-action": claim_action_id, "next-router-state-tree": RouterTree,
          "x-deployment-id": dpl
        },
        referrer: Dashboard,
        body: "[]",
        method: "POST",
        mode: "cors",
        credentials: "include",
      })

      log.points("Claim response:", claimResponse.status)
    }

    return TaskResponse.Done
}