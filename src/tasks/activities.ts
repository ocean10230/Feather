import { sleep } from "@/internal/util"
import { log } from "shared/log.ts"
import { Storage, StorageKeys } from "shared/storage.ts"
import { ActivitiesValidator, CompleteActivity } from "@/rewards/component"
import { TaskResponse } from "@/internal/task"
import { FetchPage, RSC } from "@/rewards/parser"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")

    const pageData = await FetchPage()
    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing activities list from HTML")

    const parsed_rsc = await RSC(pageData, "MoreActivities")
    const parsed = parsed_rsc.children.at(-1).activityCards
    const activities = ActivitiesValidator(parsed)

    log.activities("Validating activities list")
    
    if (!activities) return TaskResponse.InvalidInformation
    if (activities.length < 1) return TaskResponse.Confirm

    log.activities("Faking activities completion")
    
    for (const quest of activities) {
        await CompleteActivity(quest)
        await sleep(500 + (Math.random() * 500))
    }

    return TaskResponse.Done
}