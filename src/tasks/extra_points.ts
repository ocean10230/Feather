import { ScriptList } from "@/rewards/utility"
import { Dashboard, RSC } from "@/rewards/parser"
import { TaskResponse } from "@/internal/task"
import { log } from "shared/log"
import { Storage, StorageKeys } from "shared/storage"

const GetActionID = async (dpl: string): Promise<string> => {
    const cached = await Storage.get(StorageKeys.ClaimPointsNextActionId) as string
    if (cached?.endsWith("_" + dpl)) return cached

    const visited = new Set<string>(), queue = [Dashboard]

    while (queue.length) {
        const u = queue.shift()!
        if (visited.has(u)) continue
        visited.add(u)

        const r = await curl(u)
        if (!r.ok) continue
        const c = await r.text()

        if (c.includes("reportClaim")) {
            const a = c.match(/createServerReference\)\(["']([^"']+)["']/)?.[1]
            if (a) return Storage.set(StorageKeys.ClaimPointsNextActionId, a + "_" + dpl), a
        }

        const patterns = [/<script\b[^>]*\bsrc=["']([^"']+)["']/gi, /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/gi, /["'](static\/[^"']+\.js(?:\?[^"']*)?)["']/gi]
        for (const p of patterns) {
            for (const m of c.matchAll(p)) {
                let x = m[1]
                if (x.startsWith("static/")) x = "/_next/" + x
                if (!x.includes("?dpl=")) x += "?dpl=" + dpl
                try { const s = new URL(x, u).href; if (!visited.has(s)) queue.push(s) } catch {}
            }
        }
    }
    return "not_found"
}

export default async (): Promise<TaskResponse> => {
    log.points("Fetching dashboard's raw HTML")

    const fetched = await curl(Dashboard)
    const pageData = await fetched.text()

    if (!pageData) return TaskResponse.ParseFailure
    log.points("Parsing available points...")

    const parsedHtml: NextFlightData = ScriptList(pageData)
    if (parsedHtml == "00:empty") return TaskResponse.ParseFailure

    const parsed_modal = await RSC(parsedHtml, `DashboardHeader_ClaimablePoints`)
    const parsed_button = parsed_modal?.children?.[0]?.[3]
    const parsed_points = parsed_button?.instrument?.data.points as number
    const clickable = parsed_button?.instrument?.click as boolean

    const dpl = await Storage.get(StorageKeys.DeploymentId) as string

    log.points("Parsed points:", parsed_points, "Claimable:", clickable)
    log.points("Parsed ActionID", await GetActionID(dpl))

    return TaskResponse.Done
}