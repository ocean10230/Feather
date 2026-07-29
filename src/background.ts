import { Storage, StorageKeys, ScriptList, Alarms, date, Message } from "./rewards/utility.ts"
import {
  reportSearch, parseData, postQuest, RefreshSession,
  FetchPage, ParseClaimPointsNextActionID, parseRouterTree
} from "./rewards/component.ts"

import { sleep, log, has_tag } from "./expand.ts"
import { AddPreregisteredTasks, ClearTaskStatus, Listen, Register } from "./task.ts"

const Task = {
  Activity: async (): Promise<TaskResponse> => {
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
  },

  PersistenceQuests: async () => {
    // path regex, /earn/quest/    
  },

  EarnPoints: async (): Promise<TaskResponse> => {
    if (has_tag("ignore_points")) return TaskResponse.Ignored
    log.claim_points("Fetching dashboard's raw HTML")

    const fetched = await fetch('https://rewards.bing.com/dashboard');
    const pageData = await fetched.text()

    if (!pageData) return TaskResponse.ParseFailure
    log.claim_points("Parsing available points...")

    let parsedHtml: NextFlightData = "00:empty"
    try { parsedHtml = ScriptList(pageData); } catch {}
    if (parsedHtml == "00:empty") return TaskResponse.ParseFailure

    const parsed_modal = await parseData(parsedHtml, `DashboardHeader_ClaimablePoints`)
    const parsed_button = parsed_modal?.children?.[0]?.[3]
    const parsed_points = parsed_button?.instrument?.data.points as number
    const clickable = parsed_button?.instrument?.click as boolean

    log.claim_points("Parsed points:", parsed_points, "Claimable:", clickable)


    if (clickable && parsed_points > 0) {
      log.claim_points("Getting required paramenters...")
      const dpl = pageData.split("?dpl=")[1].split("\"")[0]
      
      if (!dpl) {
        log.claim_points("Failed to parse deployment ID, aborting...")
        return TaskResponse.ParseFailure
      }

      const claim_action_id = await ParseClaimPointsNextActionID(pageData, dpl) || "Unknown"
      
      if (!claim_action_id || claim_action_id === "Unknown") {
        log.claim_points("Failed to parse claim action ID, aborting...")
        return TaskResponse.ParseFailure
      }

      const stateRouterTree = await parseRouterTree(parsedHtml)
      log.activities(stateRouterTree)

      const Nodify = (segment: string, val: any, isRoot = false): [ any, any, null, null, number ] => {
        let parallelRoutes = {};

        if (val && val.children) {
          const child = val.children;
          parallelRoutes = { children: Nodify( child[0], child[1], false ) };
        }

        return [ segment, parallelRoutes, null, null, isRoot ? 16 : 0 ]
      }

      const ParseTree = (tree: any[]): any => {
        const s = tree[0]
        const r = tree[1]
        return Nodify(s,r,true)
      }

      const routerStateTree = ParseTree(stateRouterTree)
      const encodedStateTree = encodeURIComponent(JSON.stringify(routerStateTree))

      log.claim_points("Claiming unclaimed", parsed_points, " points...")

      const claimResponse = await fetch("https://rewards.bing.com/dashboard", {
        "headers": {
          "accept": "text/x-component", "content-type": "text/plain;charset=UTF-8",
          "next-action": claim_action_id, "next-router-state-tree": encodedStateTree,
          "x-deployment-id": dpl
        },
        referrer: "https://rewards.bing.com/dashboard",
        body: "[]",
        method: "POST",
        mode: "cors",
        credentials: "include",
      });

      console.log("Claim response:", claimResponse.status)
    }

    return TaskResponse.Done
  }
}

const init = async () => {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map(rule => rule.id);
    console.log("Removing leftover dynamic rules :", ruleIds)
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
  });

  await RefreshSession();
  const todaydate = await Storage.get(StorageKeys.Today) as QuestDateFormat

  AddPreregisteredTasks(Alarms.PCSearch, Alarms.MobileSearch, Alarms.Activties, Alarms.ClaimPoints)

  // if its not today then kaboom
  if (todaydate !== date()) {
    log.initlialize("Detected date change, resetting progress")
    Storage.set(StorageKeys.Today, date())
    Storage.set(StorageKeys.ActivitiesCompletion, false)
    Storage.set(StorageKeys.SearchCompletion, false)
    ClearTaskStatus()
  }

  log.initlialize("Creating alarms")
  Register({ name: Alarms.Activties, interval: 2, handler: Task.Activity })
  Register({ name: Alarms.PCSearch, interval: 7, handler: Task.Activity })
  Register({ name: Alarms.ClaimPoints, interval: 10, handler: Task.Activity })
  Listen();
}

chrome.runtime.onStartup.addListener(() => init())
chrome.runtime.onInstalled.addListener(() => {
  const manifest = chrome.runtime.getManifest();
  console.error(Message.replace('\${extension_version}', manifest.version).replace('\${extension_name}', manifest.name))
  init()
})