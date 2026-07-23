import { pcall, Storage, StorageKeys, ScriptList, Alarms, date } from "./utility"
import { reportSearch, parseData, postQuest, RefreshSession, searches } from "./rewards"
import { sleep, log, has_tag } from "./expand"

const PageData: RequestInit[] = [
  {
    headers: {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0", "priority": "u=0, i",
      "sec-fetch-dest": "document", "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin", "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    method: "GET", credentials: "include", referrer: "https://rewards.bing.com/earn"
  },

  {
    headers: { "priority": "u=1, i", "rsc": "1", },
    referrer: "https://rewards.bing.com/earn", method: "GET", credentials: "include"
  }
]

let CachedPage;
const fetchPage = async (): Promise<NextFlightData> => {
  const [res, suc] = await pcall(async () => {
    if (CachedPage) return CachedPage

    const response = await fetch('https://rewards.bing.com/earn', PageData[0])
    const html = await response.text();
    let parsedHtml: NextFlightData = "00:empty"

    try { parsedHtml = ScriptList(html); }
    catch { console.log("i got black. i got white. what you want?") }

    return parsedHtml
  })

  if (suc) return res
  else throw new Error(`couldn't fetch data: ${res}`)
}

const Task = {
  Search: async (): Promise<AutomationResponse | "QUERIES_GENERATION_FAILURE"> => {
    if (has_tag("ignore_pc_search")) {
      await Storage.set(StorageKeys.SearchCompletion, true)
      return "DONE_CONFIRMED"
    }

    const completed = await Storage.get(StorageKeys.SearchCompletion)
    if (completed == true) return "DONE"

    // get search information
    const queries = [...searches].sort(() => 0.5 - Math.random())
    const queryIsntNull = queries.find(Boolean)

    log.pc_search("Queries list length:", queries.length, "items")

    if (queries.find(e => !e) || !queryIsntNull) return "QUERIES_GENERATION_FAILURE"

    let searchesDone = 0
    const maxSearches = 30

    log.pc_search("Current search progress:", `${searchesDone}/${maxSearches}`)

    // search done
    if (searchesDone >= maxSearches) {
      log.pc_search("Searches done confirmed, stopping searching for today")
      Storage.set(StorageKeys.SearchCompletion, true)
      return "DONE_CONFIRMED"
    }

    // self-explainatory
    for (const query of queries) {
      if (searchesDone >= maxSearches) break
      try {
        const [_, __] = await Promise.all([ fetch(`https://bing.com/search?q=${query}`), reportSearch( query ) ]);
      }
      catch(e) { console.error("Failed to search:", e) }

      searchesDone++
      await sleep(7000 + Math.random() * 3500)
    }

    log.pc_search("Done. Awaiting confirmation")
    return "DONE"
  },

  Activity: async (): Promise<AutomationResponse | "PARSED_DATA_NOT_FOUND" | "QUESTS_NOT_FOUND" | "INVALID_QUEST_DATA" | "NO_TAB_ID"> => {
    if (has_tag("ignore_activities")) {
      await Storage.get(StorageKeys.ActivitiesCompletion)
      return "DONE_CONFIRMED"
    }
    
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return "DONE"

    log.activities("Getting activities")

    const pageData = await fetchPage()
    if (!pageData) return "PARSED_DATA_NOT_FOUND"

    log.activities("Parsing activities list from HTML")
    const arr = Array.isArray
    const parsed_activities = await parseData(pageData, "MoreActivities")
    const activities = (parsed_activities.children as Array<Record<string, any>>)?.at(-1)?.activityCards

    // validate data
    log.activities("Validating activities list")
    if (!activities) return "QUESTS_NOT_FOUND"
    if (!arr(activities)) return "INVALID_QUEST_DATA"
    log.activities("Filtering activities list")

    // bimbimbabmbam
    const combinedList = [...activities]
    const unlockedQuests = combinedList.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    const formattedList = unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))

    if (formattedList.length < 1) return "DONE_CONFIRMED"
    log.activities("Faking activities completion")
    
    // more bimbimbambam
    const rewardTab = await chrome.tabs.create({ url: "https://rewards.bing.com/earn", active: !1 }); if (!rewardTab.id) return "NO_TAB_ID"
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
    
    return "DONE"
  },

  PersistenceQuests: async () => {
    // path regex, /earn/quest/    
  },

  EarnPoints: async () => {
    if (has_tag("ignore_points")) return

    log.claim_points("Fetching dashboard's raw HTML")
    const fetched = await fetch('https://rewards.bing.com/dashboard', PageData[0]);
    const pageData = await fetched.text()

    if (!pageData) return "PARSED_DATA_NOT_FOUND"

    log.claim_points("Parsing available points...")

    let parsedHtml: NextFlightData = "00:empty"
    try { parsedHtml = ScriptList(pageData); } catch {}
    if (parsedHtml == "00:empty") return "PARSED_DATA_NOT_FOUND"

    const parsed_modal = await parseData(parsedHtml, `DashboardHeader_ClaimablePoints`)
    const parsed_button = parsed_modal?.children?.[0]?.[3]
    const parsed_points = parsed_button?.instrument?.data.points as number
    const clickable = parsed_button?.instrument?.click as boolean

    log.claim_points("Parsed points:", parsed_points, "Clickable:", clickable)

    if (clickable && parsed_points > 0) {
      log.claim_points("Claiming your ", parsed_points, "unclaimed points...")

      const dpl = pageData.split("?dpl=")[1].split("\"")[0]

      fetch("https://rewards.bing.com/dashboard", {
        "headers": {
          "accept": "text/x-component",
          "content-type": "text/plain;charset=UTF-8",
          "next-action": "00cf5ba7699f0e920ffcff223f9e48fea78fd49784",
          "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C16%5D",
          "x-deployment-id": dpl
        },
        "referrer": "https://rewards.bing.com/dashboard",
        "body": "[]",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
      }).then(async (r) => {
        if (r.statusText != "OK")
          console.error("Claiming points failed, Microsoft backend error. HTTP status: ", r.status)
        else
          console.log("Claimed the points successfully")

        await fetch("https://rewards.bing.com/dashboard?_rsc=m4hDHKgQwxYB2kdn", {
          "headers": {
            "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2C%22refetch%22%2C16%5D",
            "rsc": "1", "x-deployment-id": dpl
          },
          "referrer": "https://rewards.bing.com/dashboard",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "omit"
        });
      })
    }

    return "DONE";
  }
}

const init = async () => {
  await RefreshSession();
  const todaydate = await Storage.get(StorageKeys.Today) as QuestDateFormat

  // if its not today then kaboom
  if (todaydate !== date()) {
    log.initlialize("Detected date change, resetting progress")
    Storage.set(StorageKeys.Today, date())
    Storage.set(StorageKeys.ActivitiesCompletion, false)
    Storage.set(StorageKeys.SearchCompletion, false)
  }

  // setup some stupid alarms
  log.initlialize("Creating alarms")
  chrome.alarms.create(Alarms.PCSearch, { periodInMinutes: 3.8 })
  chrome.alarms.create(Alarms.MobileSearch, { periodInMinutes: 2 })
  chrome.alarms.create(Alarms.Activties, { periodInMinutes: 1 })
  chrome.alarms.create(Alarms.ClaimPoints, { periodInMinutes: 7.5 })

  // bimbimbambam
  await sleep(2000)
  Task.Activity().then( id => {
    log.activities("Completion status ID:", id)
    if (id == "DONE_CONFIRMED") chrome.alarms.clear(Alarms.Activties)
  })

  Task.Search().then(id => {
    log.pc_search("Completion status ID:", id)
    if (id == "DONE_CONFIRMED") chrome.alarms.clear(Alarms.PCSearch)
  })

  Task.EarnPoints().then(id => log.claim_points("Completion status ID:", id))
}

// Events 
import { Message } from "./utility"

chrome.runtime.onStartup.addListener(() => init())
chrome.runtime.onInstalled.addListener(() => {
  const manifest = chrome.runtime.getManifest();
  console.error(Message.replace('\${extension_version}', manifest.version).replace('\${extension_name}', manifest.name))
  init()
})

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === Alarms.PCSearch) Task.Search()
  if (alarm.name === Alarms.Activties) Task.Activity()
  if (alarm.name === Alarms.ClaimPoints) Task.EarnPoints()
})