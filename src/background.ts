import { Storage, StorageKeys, Alarms, Message, CleanUp, InitializeSpoofing } from "@/rewards/utility"
import { Listen, Register } from "@/task"
import { RefreshSession } from "@/rewards/component"
import { log } from "@/expand"

import pc_search from "@/tasks/searches"
import extra_points from "@/tasks/extra_points"
import activities from "@/tasks/activities"
import daily_set from "@/tasks/daily_set"
import quests from "@/tasks/quests"
import visual_search from "@/tasks/visual_search"

const RUN_EVERY_MIN = 30
const COOLDOWN_MS = RUN_EVERY_MIN * 60 * 1000
const DEBUG = true

globalThis.api = chrome
globalThis.runtime = chrome.runtime
globalThis.tabs = chrome.tabs

let isInitializing = false

const init = async () => {
  if (isInitializing) return
  isInitializing = true

  try {
    const [delayedStart, storedDay] = await Promise.all([
      Storage.get(StorageKeys.RunAfter) as Promise<number | undefined>,
      Storage.get(StorageKeys.Today) as Promise<number | undefined>
    ])

    const now = Date.now()
    if (now < (delayedStart ?? 0) && !DEBUG) return

    const currentDay = new Date().getDay()

    const setupTasks: Promise<any>[] = [
      Storage.set(StorageKeys.RunAfter, now + COOLDOWN_MS),
      CleanUp(),
      InitializeSpoofing(),
      RefreshSession()
    ]

    if (storedDay !== currentDay) {
      setupTasks.push(
        Storage.set(StorageKeys.Today, currentDay),
        Storage.set(StorageKeys.ActivitiesCompletion, false),
        Storage.set(StorageKeys.DailySetCompletion, false),
        Storage.set(StorageKeys.SearchCompletion, false),
        Storage.set(StorageKeys.VisualSearchCompletion, false)
      )
    }

    await Promise.all(setupTasks)

    await Promise.all([
      Register({ name: Alarms.Activties, interval: 2, handler: activities }),
      Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search }),
      Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points }),
      Register({ name: Alarms.DailySet, interval: 25, handler: daily_set }),
      Register({ name: Alarms.Quests, interval: 25, handler: quests }),
      Register({ name: Alarms.VisualSearch, interval: 60, handler: visual_search })
    ])

    log.initlialize("Creating alarms")
    Listen()
  } finally {
    isInitializing = false
  }
}

runtime.onStartup.addListener(() => { void init() })
runtime.onInstalled.addListener(() => {
  const manifest = runtime.getManifest()
  console.error(Message.replace('${extension_version}', manifest.version).replace('${extension_name}', manifest.name))
  void init()
})