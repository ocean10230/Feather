import { Alarms, InitializeSpoofing } from "@/rewards/utility"
import { Storage, StorageKeys } from "shared/storage"
import { Listen, Register } from "@/internal/task"
import { RefreshSession } from "@/rewards/component"

import pc_search from "@/tasks/searches"
import extra_points from "@/tasks/extra_points"
import activities from "@/tasks/activities"
import daily_set from "@/tasks/daily_set"
import visual_search from "@/tasks/visual_search"

api = chrome
runtime = api.runtime
tabs = api.tabs
alarm = api.alarms
declare = api.declarativeNetRequest
curl = fetch
params = URLSearchParams
json = JSON
math = Math

let ExtensionStarted = false

const Initialize = async () => {
  if (ExtensionStarted) return
  ExtensionStarted = true

  const storedDay = await Storage.get(StorageKeys.Today)
  const currentDay = new Date().getDay()

  if (storedDay !== currentDay) await Promise.all([
    Storage.set(StorageKeys.Today, currentDay),
    Storage.set(StorageKeys.ActivitiesCompletion, false),
    Storage.set(StorageKeys.DailySetCompletion, false),
    Storage.set(StorageKeys.SearchCompletion, false),
    Storage.set(StorageKeys.VisualSearchCompletion, false)
  ])
  

  await InitializeSpoofing()

  await Promise.all([
    Register({ name: "SessionRefresh", interval: 30, handler: RefreshSession }),
    Register({ name: Alarms.Activties, interval: 2, handler: activities }),
    Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search }),
    Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points }),
    Register({ name: Alarms.DailySet, interval: 25, handler: daily_set }),
    Register({ name: Alarms.VisualSearch, interval: 60, handler: visual_search })
  ])

  Listen()
}

runtime.onInstalled.addListener(Initialize)
runtime.onStartup.addListener(Initialize)