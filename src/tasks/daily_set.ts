import { sleep } from "@/internal/util"
import { log } from "shared/log"
import { Storage, StorageKeys } from "shared/storage"
import { ActivitiesValidator, CompleteActivity } from "@/rewards/component"
import { TaskResponse } from "@/internal/task"
import { Dashboard, FetchPage, RSC } from "@/rewards/parser"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.DailySetCompletion)
    if (completed == true) return TaskResponse.Confirm
    
    log.activities("Getting set")

    const pageData = await FetchPage(Dashboard)
    if (!pageData) return TaskResponse.ParseFailure
    const activities =  ActivitiesValidator((await RSC(pageData, `\"partner\":\"dailyset\"`))?.children[1][3].model.dailySetItems)
    if (!activities) return TaskResponse.InvalidInformation
    if (activities.length < 1) return TaskResponse.Confirm

    log.activities("Faking completions")
    
    for (const quest of activities) {
        await CompleteActivity(quest)
        await sleep(500 + (math.random() * 500))
    }

    return TaskResponse.Done
  }