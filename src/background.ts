import { Storage, StorageKeys, Alarms, date, Message, CleanUp, InitializeSpoofing } from "@/rewards/utility.ts"
import { ClearTaskStatus, Listen, Register } from "@/task.ts"
import { RefreshSession} from "@/rewards/component.ts"
import { log } from "@/expand.ts"

import pc_search from "@/tasks/searches.ts"
import extra_points from "@/tasks/extra_points.ts"
import activities from "@/tasks/activities.ts"

let initialized = false

const init = async () => {
  if (initialized) return
  initialized = true

  await CleanUp()
  await RefreshSession()
  await InitializeSpoofing()

  // Register tasks
  await Register({ name: Alarms.Activties, interval: 2, handler: activities })
  await Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search })
  await Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points })

  // if its not today then kaboom
  if (await Storage.get(StorageKeys.Today) as QuestDateFormat !== date()) {
    log.initlialize("Detected date change, resetting progress")

    await Promise.all([
      Storage.set(StorageKeys.Today, date()),
      Storage.set(StorageKeys.ActivitiesCompletion, false),
      Storage.set(StorageKeys.SearchCompletion, false),
      ClearTaskStatus()
    ])
  }

  log.initlialize("Creating alarms")
  Listen();
}

chrome.runtime.onStartup.addListener(() => { void init() })
chrome.runtime.onInstalled.addListener(() => {
  const manifest = chrome.runtime.getManifest();
  console.error(Message.replace('\${extension_version}', manifest.version).replace('\${extension_name}', manifest.name))
  void init()
})

void init()