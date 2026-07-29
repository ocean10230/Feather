import { has_tag, sleep, log } from "@/expand"
import { Storage, StorageKeys, date } from "@/rewards/utility"
import { parseData, FetchPage, postQuest } from "@/rewards/component"

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
    
    // more bimbimbambam
    const rewardTab = await chrome.tabs.create({ url: "https://rewards.bing.com/earn", active: !1 })
    if (!rewardTab.id) return TaskResponse.BrowserError
    await sleep(3 * 1000);

    await chrome.tabs.sendMessage(rewardTab.id, {
      type: "CHANGE_TITLE",
      value: "Completing quests – Do not close"
    })
    
    for (const quest of formattedList) {
      await postQuest(rewardTab.id, quest);
      await sleep(500 + (Math.random() * 500))
    }
    await sleep(2000)
    await chrome.tabs.remove([rewardTab.id])
    
    return TaskResponse.Done
  }