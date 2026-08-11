import { Storage, StorageKeys, Alarms, CleanUp, InitializeSpoofing } from "@/rewards/utility"
import { Listen, Register } from "@/task"
import { RefreshSession } from "@/rewards/component"
import { InitConsole, log } from "@/internal"

import pc_search from "@/tasks/searches"
import extra_points from "@/tasks/extra_points"
import activities from "@/tasks/activities"
import daily_set from "@/tasks/daily_set"
import visual_search from "@/tasks/visual_search"

globalThis.api = chrome
globalThis.runtime = chrome.runtime
globalThis.tabs = chrome.tabs

let ExtensionStarted = false

const Initialize = async () => {
  if (ExtensionStarted) return
  ExtensionStarted = true

  await InitConsole()

  const storedDay = await Storage.get(StorageKeys.Today)
  const currentDay = new Date().getDay()

  if (storedDay !== currentDay) {
    await Promise.all([
      Storage.set(StorageKeys.Today, currentDay),
      Storage.set(StorageKeys.ActivitiesCompletion, false),
      Storage.set(StorageKeys.DailySetCompletion, false),
      Storage.set(StorageKeys.SearchCompletion, false),
      Storage.set(StorageKeys.VisualSearchCompletion, false)
    ])
  }

  await Promise.all([
    CleanUp(),
    InitializeSpoofing(),
    RefreshSession()
  ])

  await Promise.all([
    Register({ name: Alarms.Activties, interval: 2, handler: activities }),
    Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search }),
    Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points }),
    Register({ name: Alarms.DailySet, interval: 25, handler: daily_set }),
    Register({ name: Alarms.VisualSearch, interval: 60, handler: visual_search })
  ])

  log.initialize("Creating alarms")
  Listen()
}

runtime.onInstalled.addListener(() => Initialize())
runtime.onStartup.addListener(() => Initialize())
Initialize()