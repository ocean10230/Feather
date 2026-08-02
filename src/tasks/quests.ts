import { TaskResponse } from "@/task-response"
import { FetchPage, parseData, RouterTree } from "@/rewards/component"
import { ScriptList, StorageKeys } from "@/rewards/utility"
import { log } from "@/expand"
import { Storage } from "@/rewards/utility"

export default async (): Promise<TaskResponse> => {
    const page = await FetchPage()
    if (!page) return TaskResponse.ParseFailure

    log.quests("Parsing quests list from HTML")

    const parsed_quests = await parseData(page, `"href":"/earn/quest/`)
    if (!parsed_quests) return TaskResponse.ParseFailure

    log.quests("In Demo - Only parsing data from the first list to avoid error to get flagged as false ban")

    const all_quests = parsed_quests.children[3].children
    const first = all_quests[0][3]

    const html = await (await fetch("https://rewards.bing.com/" + first.href)).text()
    const listed_script = ScriptList(html)
    const quest_actions = await parseData(listed_script, `"hash"`, true)
    
    const dpl = await Storage.get(StorageKeys.DeploymentId) as string
    const debug = true

    for (const action of quest_actions) {
        const quest_data = action.children[1][3].children[1][3]

        const [href, hash, completed, disabled, locked, offerId, clickable] = [
            quest_data.href,
            quest_data.hash,
            quest_data.isCompleted,
            quest_data.isDisabled,
            quest_data.isLocked,
            quest_data.offerId,
            quest_data.children[3].instrument.click
        ]
        
        if (!debug && href && (!completed && !disabled && !locked) && offerId && clickable) {
            await fetch("https://rewards.bing.com/earn/quest/" + offerId, {
                "headers": {
                    "accept": "text/x-component",
                    "accept-language": "en-US,enq=0.9",
                    "content-type": "text/plaincharset=UTF-8",
                    "next-action": "70babbc81d2724f60d29a95c03b3d739cba77cea92",
                    "next-router-state-tree": RouterTree,
                    "x-deployment-id": dpl
                },
                "referrer": "https://rewards.bing.com/earn/quest/" + offerId,
                "body": JSON.stringify([
                    hash, 11, {
                    isPromotional: "$undefined",
                    offerid: offerId,
                    timezoneOffset: String(new Date().getTimezoneOffset())
                }]),
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            })
        }
    }

    return TaskResponse.Done
}