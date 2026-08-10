/*

import { TaskResponse } from "@/task"
import { Bing, FetchPage, RSC } from "@/rewards/component"
import { ScriptList } from "@/rewards/utility"
import { log } from "@/internal"

export default async (): Promise<TaskResponse> => {
    const page = await FetchPage()
    if (!page) return TaskResponse.ParseFailure

    log.quests("Parsing quests list from HTML")

    const parsed_quests = await RSC(page, `"href":"/earn/quest/`)
    if (!parsed_quests) return TaskResponse.ParseFailure

    const all_quests = parsed_quests.children[3].children
    const first = all_quests[1][3]



    return TaskResponse.Done
}
*/