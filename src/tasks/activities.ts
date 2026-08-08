import { sleep, log } from "@/expand"
import { date, Storage, StorageKeys } from "@/rewards/utility"
import { RSC, FetchPage, ExecuteQuest } from "@/rewards/component"
import { TaskResponse } from "@/task"

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")
    const pageData = await FetchPage()

    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing activities list from HTML")
    const arr = Array.isArray
    const parsed_activities = await RSC(pageData, "MoreActivities")
    const activities = (parsed_activities.children as Array<Record<string, any>>)?.at(-1)?.activityCards

    // validate data
    log.activities("Validating activities list")
    if (!arr(activities)) return TaskResponse.InvalidInformation

    // bimbimbabmbam
    const combinedList = [...activities]
    const unlockedQuests = combinedList.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    const todayList: QuestData[] = unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))

    if (todayList.length < 1) return TaskResponse.Confirm
    log.activities("Faking activities completion")
    
    // more bimbimbambam
    for (const quest of todayList) {
        await ExecuteQuest(quest)
        await sleep(500 + (Math.random() * 500))
    }

    return TaskResponse.Done
  }