import { InitializeSpoofing } from "@/helpers/spoofing"
import { Storage, StorageKeys } from "@/helpers/storage"
import { Listen, Register } from "@/task"
import { RefreshSession } from "@/helpers/rewards"

import Searches from "@/main/searches"
import AutoClaim from "@/main/extra_points"
import Activities from "@/main/activities"
import DailySet from "@/main/daily_set"
import VisualSearch from "@/main/visual_search"

api = chrome
runtime = api.runtime
tabs = api.tabs
alarm = api.alarms
declare = api.declarativeNetRequest
curl = fetch

const Initialize = async () => {
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
    Register({ name: "Activities", interval: 2, handler: Activities }),
    Register({ name: "Searches", interval: 7, handler: Searches }),
    Register({ name: "ClaimPoints", interval: 10, handler: AutoClaim }),
    Register({ name: "DailySet", interval: 25, handler: DailySet }),
    Register({ name: "VisualSearch", interval: 60, handler: VisualSearch })
  ])

  Listen()
}

runtime.onInstalled.addListener(Initialize)
runtime.onStartup.addListener(Initialize)