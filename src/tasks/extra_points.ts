import { ScriptList } from "@/rewards/utility"
import { Dashboard, RouterTree, RSC } from "@/rewards/parser"
import { TaskResponse } from "@/internal/task"
import { log } from "shared/log.ts"
import { Storage, StorageKeys } from "shared/storage"

const GetActionID = async (dpl: string): Promise<string> => {
  if (((await Storage.get(StorageKeys.ClaimPointsNextActionId)) as string).split("_")[1] == dpl) return await Storage.get(StorageKeys.ClaimPointsNextActionId) as string

  const visited = new Set<string>(), queue: string[] = [Dashboard]

  const url = (x: string, b: string): string | null => {
    if (x.startsWith("static/")) x = "/_next/" + x
    if (!x.includes("?dpl=")) x = x + "?dpl=" + dpl
    try { return new URL(x, b).href } catch { return null }
  }

  const scripts = (c: string, b: string): Set<string> => {
    const s = new Set<string>()
    for (const m of c.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) { const x = url(m[1], b); if (x) s.add(x) }
    for (const m of c.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/gi)) { const x = url(m[1], b); if (x) s.add(x) }
    for (const m of c.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/gi)) { const x = url(m[1], b); if (x) s.add(x) }
    for (const m of c.matchAll(/["'](static\/[^"']+\.js(?:\?[^"']*)?)["']/gi)) { const x = url(m[1], b); if (x) s.add(x) }
    return s
  }

  const action = (c: string): string | null => {
    if (!c.includes("reportClaim")) return null
    return c.match(/createServerReference\)\(["']([^"']+)["']/)?.[1] || null
  }

  while (queue.length) {
    const u = queue.shift()!
    if (visited.has(u)) continue
    visited.add(u)

    const r = await fetch(u)
    if (!r.ok) continue
    const c = await r.text()
    const a = action(c)
    if (a) {
      Storage.set(StorageKeys.ClaimPointsNextActionId, a + "_" + dpl)
      return a
    }
    for (const s of scripts(c, u)) if (!visited.has(s)) queue.push(s)
  }

  return "not_found"
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
    const dpl = await Storage.get(StorageKeys.DeploymentId) as string
    log.points("Parsed ActionID", GetActionID(dpl))

    if (clickable && parsed_points > 0) {
      log.points("Getting required paramenters...")
      const dpl = await Storage.get(StorageKeys.DeploymentId) as string | None
      
      if (!dpl) {
        log.points("Failed to parse deployment ID, aborting...")
        return TaskResponse.ParseFailure
      }

      const claim_action_id = await GetActionID(dpl) 
      
      if (!claim_action_id || claim_action_id === "not_found") {
        log.points("Failed to parse claim action ID, aborting...")
        return TaskResponse.ParseFailure
      }

      log.points("Claiming unclaimed", parsed_points, " points...")

      const claimResponse = await fetch(Dashboard, {
        "headers": {
          "accept": "text/x-component", "content-type": "text/plaincharset=UTF-8",
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