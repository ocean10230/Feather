import { log } from "@/expand"
import { TaskResponse } from "@/task"
import { ExecuteQuest, FetchPage, RSC } from "@/rewards/component"
import { ScriptList, StorageKeys, Storage } from "@/rewards/utility"

export default async (): Promise<TaskResponse> => {
    const page = await FetchPage()
    if (!page) return TaskResponse.ParseFailure

    log.quests("Parsing quests list from HTML")

    const parsed_quests = await RSC(page, `"href":"/earn/quest/`)
    if (!parsed_quests) return TaskResponse.ParseFailure

    log.quests("In Demo - Only parsing data from the first list to avoid error to get flagged as false ban")

    const all_quests = parsed_quests.children[3].children
    const first = all_quests[1][3]

    const html = await (await fetch("https://rewards.bing.com" + first.href)).text()
    const listed_script = ScriptList(html)
    const quest_actions = await RSC(listed_script, `"hash"`, true)
    
    const dpl = await Storage.get(StorageKeys.DeploymentId) as string
    const debug = true

    log.quests(quest_actions)

    for (const action of quest_actions) {
        const first_node = action.children?.[1][3]
        const second_node = first_node.children?.[1][3]

        const quest: QuestData = typeof second_node === 'object' && second_node !== null 
            ? second_node 
            : first_node
        
        if (!debug && quest.href && (!quest.isCompleted && !quest.isLocked && !quest.isDisabled) && quest.offerId) await ExecuteQuest(quest, dpl)
        
    }

    return TaskResponse.Done
}