import { log, sleep } from "@/internal"
import { date, Storage, StorageKeys } from "@/rewards/utility"
import { RSC, FetchPage, ExecuteQuest, Dashboard } from "@/rewards/component"
import { TaskResponse } from "@/task"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.DailySetCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")
    const pageData = await FetchPage(Dashboard)

    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing activities list from HTML")
    const arr = Array.isArray
    const parsed_activities = await RSC(pageData, `\"DailySetSection\"`)
    const activities = parsed_activities.children[3].dailySetItems

    log.activities("Validating daily activities list", parsed_activities, )
    if (!arr(activities)) return TaskResponse.InvalidInformation
    log.activities("Filtering daily activities list")

    const combinedList = [...activities]
    const unlockedQuests = combinedList.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    const todayList: QuestData[] = unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))
    
    if (todayList.length < 1) return TaskResponse.Confirm
    log.activities("Faking daily set completion")
    
    for (const quest of todayList) {
        await ExecuteQuest(quest)
        await sleep(500 + (Math.random() * 500))
    }


    return TaskResponse.Done
  }