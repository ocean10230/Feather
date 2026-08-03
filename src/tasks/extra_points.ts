import { has_tag, log } from "@/expand"
import { ScriptList, StorageKeys, Storage } from "@/rewards/utility"
import { ParseActionId, parseData, RouterTree } from "@/rewards/component"
import { TaskResponse } from "@/task"

export default async (): Promise<TaskResponse> => {
    if (has_tag("ignore_points")) return TaskResponse.Ignored
    log.claim_points("Fetching dashboard's raw HTML")

    const fetched = await fetch('https://rewards.bing.com/dashboard');
    const pageData = await fetched.text()

    if (!pageData) return TaskResponse.ParseFailure
    log.claim_points("Parsing available points...")

    let parsedHtml: NextFlightData = "00:empty"
    try { parsedHtml = ScriptList(pageData); } catch {}
    if (parsedHtml == "00:empty") return TaskResponse.ParseFailure

    const parsed_modal = await parseData(parsedHtml, `DashboardHeader_ClaimablePoints`)
    const parsed_button = parsed_modal?.children?.[0]?.[3]
    const parsed_points = parsed_button?.instrument?.data.points as number
    const clickable = parsed_button?.instrument?.click as boolean

    log.claim_points("Parsed points:", parsed_points, "Claimable:", clickable)

    if (clickable && parsed_points > 0) {
      log.claim_points("Getting required paramenters...")
      const dpl = await Storage.get(StorageKeys.DeploymentId) as string | None
      
      if (!dpl) {
        log.claim_points("Failed to parse deployment ID, aborting...")
        return TaskResponse.ParseFailure
      }

      const claim_action_id = await ParseActionId(pageData, dpl, "ClaimPoints", ["PointsClaimSidePanel", "earnMoreCta"]) || "Unknown"
      
      if (!claim_action_id || claim_action_id === "Unknown") {
        log.claim_points("Failed to parse claim action ID, aborting...")
        return TaskResponse.ParseFailure
      }

      log.claim_points("Claiming unclaimed", parsed_points, " points...")

      const claimResponse = await fetch("https://rewards.bing.com/dashboard", {
        "headers": {
          "accept": "text/x-component", "content-type": "text/plain;charset=UTF-8",
          "next-action": claim_action_id, "next-router-state-tree": RouterTree,
          "x-deployment-id": dpl
        },
        referrer: "https://rewards.bing.com/dashboard",
        body: "[]",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });

      console.log("Claim response:", claimResponse.status)
    }

    return TaskResponse.Done
}

/*

    const stateRouterTree = await parseRouterTree(parsedHtml)
      log.activities(stateRouterTree)

      const Nodify = (segment: string, val: any, isRoot = false): [ any, any, null, null, number ] => {
        let parallelRoutes = {};

        if (val && val.children) {
          const child = val.children;
          parallelRoutes = { children: Nodify( child[0], child[1], false ) };
        }

        return [ segment, parallelRoutes, null, null, isRoot ? 16 : 0 ]
      }

      const ParseTree = (tree: any[]): any => {
        const s = tree[0]
        const r = tree[1]
        return Nodify(s,r,true)
      }

      const routerStateTree = ParseTree(stateRouterTree)
      const encodedStateTree = encodeURIComponent(JSON.stringify(routerStateTree))

*/