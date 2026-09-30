import { log } from "@/helpers/debugging"
import { Storage, StorageKeys } from "@/helpers/storage"
import { ActivitiesValidator, CompleteActivity } from "@/helpers/rewards"
import { TaskResponse } from "@/task"
import { Dashboard, FetchPage, RSC } from "@/helpers/parser"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.DailySet)
    if (completed == true) return TaskResponse.Confirm
    
    log.activities("Parsing daily set")

    const pageData = await FetchPage(Dashboard)
    if (!pageData) return TaskResponse.ParseFailure
    const activities = ActivitiesValidator((await RSC(pageData, `\"partner\":\"dailyset\"`))?.children[1][3].model.dailySetItems)
    if (!activities) return TaskResponse.InvalidInformation
    if (activities.length < 1) return TaskResponse.Confirm
    
    for (const quest of activities) {
        await CompleteActivity(quest)
    }

    return TaskResponse.Done
  }