import { Storage, StorageKeys, Alarms, date, Message, CleanUp, InitializeSpoofing } from "@/rewards/utility.ts"
import { Listen, Register } from "@/task.ts"
import { RefreshSession } from "@/rewards/component.ts"
import { log, sleep } from "@/expand.ts"

import pc_search from "@/tasks/searches.ts"
import extra_points from "@/tasks/extra_points.ts"
import activities from "@/tasks/activities.ts"
import daily_set from "./tasks/daily_set"
import quests from "./tasks/quests"
import visual_search from "./tasks/visual_search"

const RUN_EVERY_MIN = 30
const COOLDOWN_MS = RUN_EVERY_MIN * 60 * 1000

const init = async () => {
  const runAfter = (await Storage.get(StorageKeys.RunAfter) as number) ?? 0
  if (Date.now() < runAfter) return
  await Storage.set(StorageKeys.RunAfter, Date.now() + COOLDOWN_MS)

  await CleanUp()
  await RefreshSession()
  await InitializeSpoofing()

  await sleep(200)

  await Register({ name: Alarms.Activties, interval: 2, handler: activities })
  await Register({ name: Alarms.PCSearch, interval: 7, handler: pc_search })
  await Register({ name: Alarms.ClaimPoints, interval: 10, handler: extra_points })
  await Register({ name: Alarms.DailySet, interval: 25, handler: daily_set })
  await Register({ name: Alarms.Quests, interval: 25, handler: quests })
  await Register({ name: Alarms.VisualSearch, interval: 60, handler: visual_search })

  const storedToday = await Storage.get(StorageKeys.Today) as QuestDateFormat
  const currentDate = date()

  if (storedToday !== currentDate) {
    log.initlialize("Detected date change, resetting progress")

    await Promise.all([
      Storage.set(StorageKeys.Today, date()),
      Storage.set(StorageKeys.ActivitiesCompletion, false),
      Storage.set(StorageKeys.DailySetCompletion, false),
      Storage.set(StorageKeys.SearchCompletion, false),
    ])
  }

  log.initlialize("Creating alarms")
  Listen()
}

chrome.runtime.onStartup.addListener(() => { void init() })
chrome.runtime.onInstalled.addListener(async () => {
  const manifest = chrome.runtime.getManifest();
  console.error(Message.replace('\${extension_version}', manifest.version).replace('\${extension_name}', manifest.name))
  void init()
})

void init()