import { sleep } from "@/internal/util"
import { log } from "shared/log"
import { Storage, StorageKeys } from "shared/storage"
import { ActivitiesValidator, CompleteActivity } from "@/rewards/component"
import { TaskResponse } from "@/internal/task"
import { FetchPage, RSC } from "@/rewards/parser"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")

    const pageData = await FetchPage()
    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing activities")
    const activities = ActivitiesValidator( (await RSC(pageData, "MoreActivities")) .children.at(-1).activityCards )

    log.activities("Validating array")
    if (!activities) return TaskResponse.InvalidInformation
    if (activities.length < 1) return TaskResponse.Confirm

    log.activities("Faking completions")
    
    for (const quest of activities) {
        await CompleteActivity(quest)
        await sleep(500 + (math.random() * 500))
    }

    return TaskResponse.Done
}