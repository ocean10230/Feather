import { has_tag, sleep, log } from "@/expand"
import { Storage, StorageKeys, date } from "@/rewards/utility"
import { parseData, FetchPage, RouterTree, ParseActionId } from "@/rewards/component"
import { TaskResponse } from "@/task-response"

export default  async (): Promise<TaskResponse> => {
    if (has_tag("ignore_activities")) {
      await Storage.get(StorageKeys.ActivitiesCompletion)
      return TaskResponse.Confirm
    }
    
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return TaskResponse.Confirm

    log.activities("Getting activities")
    const pageData = await FetchPage()

    if (!pageData) return TaskResponse.ParseFailure

    log.activities("Parsing activities list from HTML")
    const arr = Array.isArray
    const parsed_activities = await parseData(pageData, "MoreActivities")
    const activities = (parsed_activities.children as Array<Record<string, any>>)?.at(-1)?.activityCards

    // validate data
    log.activities("Validating activities list")
    if (!arr(activities)) return TaskResponse.InvalidInformation
    log.activities("Filtering activities list")

    // bimbimbabmbam
    const combinedList = [...activities]
    const unlockedQuests = combinedList.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    const formattedList = unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))

    if (formattedList.length < 1) return TaskResponse.Confirm
    log.activities("Faking activities completion")

    const res = await fetch("https://rewards.bing.com/dashboard")
    const text = await res.text();
    const dpl = text.split("?dpl=")[1].split("\"")[0]

    const action_id = await ParseActionId(text, dpl, "ActivitiesClaimPoints", `)(["cursor-pointer"]`) as string
    
    // more bimbimbambam
    for (const quest of formattedList) {
        await fetch("https://rewards.bing.com/earn", {
            headers: {
                accept: "text/x-component",
                "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
                "content-type": "text/plain;charset=UTF-8",
                "next-action": action_id,
                "next-router-state-tree": RouterTree,
                priority: "u=1, i"
            },
            referrer: "https://rewards.bing.com/earn",
            body: quest,
            method: "POST",
            credentials: "include"
        })

        await sleep(500 + (Math.random() * 500))
    }


    return TaskResponse.Done
  }