import { Storage, StorageKeys, Alarms, date, Message } from "./rewards/utility.ts"
import { AddPreregisteredTasks, ClearTaskStatus, Listen, Register } from "./task.ts"
import { RefreshSession} from "./rewards/component.ts"
import { log } from "./expand.ts"

import pc_search from "./tasks/searches.ts"
import extra_points from "./tasks/extra_points.ts"
import activities from "./tasks/activities.ts"


const init = async () => {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    const ruleIds = rules.map(rule => rule.id);
    console.log("Removing leftover dynamic rules :", ruleIds)
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds });
  });

  await RefreshSession();
  AddPreregisteredTasks(Object.values(Alarms))

  // if its not today then kaboom
  if (await Storage.get(StorageKeys.Today) as QuestDateFormat !== date()) {
    log.initlialize("Detected date change, resetting progress")
    Storage.set(StorageKeys.Today, date())
    Storage.set(StorageKeys.ActivitiesCompletion, false)
    Storage.set(StorageKeys.SearchCompletion, false)
    ClearTaskStatus()
  }

  log.initlialize("Creating alarms")
  Register({ name: Alarms.Activties, interval: 2, handler: activities })
  Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search })
  Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points })
  Listen();
}

chrome.runtime.onStartup.addListener(() => init())
chrome.runtime.onInstalled.addListener(() => {
  const manifest = chrome.runtime.getManifest();
  console.error(Message.replace('\${extension_version}', manifest.version).replace('\${extension_name}', manifest.name))
  init()
})