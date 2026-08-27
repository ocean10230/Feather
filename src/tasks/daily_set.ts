import { sleep } from "@/internal/util"
import { Storage, StorageKeys } from "shared/storage.ts"
import { ActivitiesValidator, CompleteActivity } from "@/rewards/component"
import { TaskResponse } from "@/internal/task"
import { Dashboard, FetchPage, RSC } from "@/rewards/parser"
import { log } from 'shared/log'

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.DailySetCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")
    const pageData = await FetchPage(Dashboard)

    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing daily list from HTML")
    const parsed = (await RSC(pageData, `\"partner\":\"dailyset\"`))?.children[1][3].model.dailySetItems
    const activities = ActivitiesValidator(parsed)

    if (!activities) return TaskResponse.InvalidInformation
    if (activities.length < 1) return TaskResponse.Confirm

    log.activities("Faking daily set completion")
    
    for (const quest of activities) {
        await CompleteActivity(quest)
        await sleep(500 + (Math.random() * 500))
    }
 

    return TaskResponse.Done
  }