import { GetSearches, pcall, Storage, StorageKeys } from "./data"

await (async () => {
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

  const rewardTab = await chrome.tabs.create({ url: "https://rewards.bing.com/dashboard", active: !1 });
  const bingTab = await chrome.tabs.create({ url: "https://bing.com/", active: !1 });
  await sleep(1000);

  setTimeout(async () => {
    if (!rewardTab.id) return;
    await chrome.tabs.sendMessage(rewardTab.id, { type: "CHANGE_TITLE", value: "Preventing some CORS issues" })
    await sleep(2*1000)
    await chrome.tabs.remove([rewardTab.id])
  }, 0)

  setTimeout(async () => {
    if (!bingTab.id) return;
    await chrome.tabs.sendMessage(bingTab.id, { type: "CHANGE_TITLE", value: "Preventing some CORS issues" })
    await sleep(2*1000)
    await chrome.tabs.remove([bingTab.id])
  }, 0)
})()

// lmao im so used to roblox
type TaskResponse = "DONE" | "DONE_CONFIRMED" | "RETURN_COMPLETE"
type RewardResponseFormat = `${string}:${string}`
type QuestDateFormat = `${string}/${string}/${string}`
type idk = undefined
type cachedResponsePayload = { rsc?: RewardResponseFormat | idk, html?: RewardResponseFormat | idk, dashboard?: RewardResponseFormat }
type QuestData = {
  hash: string
  title: string
  points: number
  offerId: string
  isCompleted: boolean
  isLocked: boolean
  date?: QuestDateFormat
  isPromotional: boolean | `$undefined`
}

const idk = undefined
const cachedResponse: cachedResponsePayload = { rsc: idk, html: idk }
const searches: string[] = await GetSearches()

const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

// headers
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

// report search
const reportSearch = async(query: string) => {
  const [res, suc] = await pcall(async () => {
    const IG = randomHex(32)
    const IID = `SERP.${Math.floor(Math.random() * 10000)}`
    const rdr = Math.floor(Math.random() * 10) + 1
    const rdrig = randomHex(32)

    const url = "https://www.bing.com/rewardsapp/reportActivity"
    const params = new URLSearchParams({ IG, IID, q: query, FORM: "HDRSC1", rdr: `${rdr}`, rdrig, ajaxreq: "1" })
    const body = new URLSearchParams({ url: `https://www.bing.com/search?q=${encodeURIComponent(query)}&FORM=HDRSC1&rdr=${rdr}&rdrig=${rdrig}`, V: "web" })

    return fetch(`${url}?${params}`, {
      method: "POST", body, credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*" }
    })
  })

  if (suc) return res
  else console.error('what is the actual fuh it broke this is simple as shi: ', res)
}

// parse the stupid shit
const parseData = async (data?: string, keyword?: string): Promise<any | null> => {
  const [res, suc] = await pcall(() => {
    if (!data || !keyword) return

    // spot the one that stands out
    const list = data.split("\n")
    const breakdown = list.find((e: string) => e.includes(keyword))
    if (!breakdown) return null

    // parse and format data with the help of regret(c)
    const regex = /(?<=\b[0-9]+[a-z]?:)\[[\s\S]*\]/
    const match = breakdown.match(regex)

    if (!match) return null

    let json: string = match[0]
    json = json.replace(/"\$undefined"/g, "null")

    try {
      const parsed = JSON.parse(json)
      return parsed?.[3] ?? null
    } catch (e) {
      console.warn("Parse failed:", e)
      return null
    }
  })

  if (suc)
    return res
  else
    console.error('failed to parse data:', res)
}

/// =============================================================================== ///
/// REWARDS USER-DATA FETCHER
/// =============================================================================== ///

//@ts-expect-error: domparser isn't available natively
import { DOMParser } from 'https://esm.sh/linkedom'

const fetchPage = async (): Promise<cachedResponsePayload> => {
  const [res, suc] = await pcall(async () => {
    if (cachedResponse.rsc && cachedResponse.html) return cachedResponse

    // bimbimbambam all at once
    const promises = await Promise.all([
      fetch('https://rewards.bing.com/earn', PageData[0]),
      fetch('https://rewards.bing.com/earn?_rsc=aq46i', PageData[1])
    ])

    // parse data
    const [pageRes, rscRes] = promises
    const pageHtml = await pageRes.text()
    const rscData = await rscRes.text() as RewardResponseFormat

    let parsedHtml: RewardResponseFormat = "00:empty"
    let parsedDashboard: RewardResponseFormat = "00:empty"

    const parseHtmlScriptList = (html: string): RewardResponseFormat => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const scripts = doc.querySelectorAll("script")
      const scriptList: RewardResponseFormat[] = []
      
      scripts.forEach((element: HTMLScriptElement) => {
        if (element.innerHTML.includes("__next_f")) {
          const str = element.innerHTML
          const match = str.match(/self\.__next_f\.push\((\[.*?\])\)/s)

          if (!match) return
          const dataString = match[1]

          if (!dataString) return
          scriptList.push(JSON.parse(dataString).at(-1))
        }
      })

      return scriptList.join("\n") as RewardResponseFormat
    }

    try {
      parsedHtml = parseHtmlScriptList(pageHtml);
    }
    catch { console.log("i got black. i got white. what you want?") }

    // self-explainatory
    cachedResponse.html = parsedHtml
    cachedResponse.rsc = rscData
    cachedResponse.dashboard = parsedDashboard

    console.log(cachedResponse.dashboard)

    return cachedResponse
  })

  if (suc) return res
  else
    throw new Error(`couldn't fetch data: ${res}`)
}

/// =============================================================================== ///
/// AUTOMATION ESSENTIALS
/// =============================================================================== ///

const date=(d=new Date):QuestDateFormat=>`${(d.getMonth()+1+'').padStart(2,'0')}/${(d.getDate()+'').padStart(2,'0')}/${d.getFullYear()}`

// complete quest
const postQuest = async (tabid: number, quest: QuestData) =>
  await chrome.tabs.sendMessage(tabid, {
    type: "COMPLETE_QUEST",
    data: JSON.stringify([
      quest.hash, 11, {
        isPromotional: quest.isPromotional,
        offerid: quest.offerId,
        timezoneOffset: `${new Date().getTimezoneOffset()}`
      }
    ])
})
  

/// =============================================================================== ///
/// AUTOMATION FUNCTIONS
/// =============================================================================== ///

const Task = {
  Search: async (): Promise<TaskResponse | "STUPID_GENERATOR"> => {
    const completed = await Storage.get(StorageKeys.SearchCompletion)
    if (completed == true) return "RETURN_COMPLETE"

    // get search information
    const queries = [...searches].sort(() => 0.5 - Math.random())
    const queryIsntNull = queries.find(Boolean)

    if (queries.find(e => !e) || !queryIsntNull) return "STUPID_GENERATOR"

    // spoof search
    const [_, search] = await Promise.all([
      fetch(`https://bing.com/search?q=${queryIsntNull}`), // to avoid suspicion, make a GET request so it logs into the system
      reportSearch( queryIsntNull ) // get the points – it doesn't automatically claim points if you search with the request
    ])
    
    const textResponse = await search.text();

    const earned = Number(textResponse.split("DailySearchPointsEarned")[1].split(",")[0]) || 0
    const limit = Number(textResponse.split("DailySearchPointsLimit")[1].split(",")[0]) || 30

    let searchesDone = earned || 0
    const maxSearches = (limit || 30) + (10 + Math.random() * 10)

    // search done
    if (searchesDone >= maxSearches)
    {
      chrome.alarms.clear("searches")
      Storage.set(StorageKeys.SearchCompletion, true)
      return "DONE_CONFIRMED"
    }

    // self-explainatory
    for (const query of queries) {
      if (searchesDone >= maxSearches) break
      try { reportSearch(query) }
      catch(e) { console.error("Failed to search:", e) }

      searchesDone++
      await sleep(7000 + Math.random() * 3500)
    }

    return "DONE"
  },

  MobileSearch: async (): Promise<TaskResponse | "STUPID_GENERATOR"> => {
    const completed = await Storage.get(StorageKeys.MobileSearchCompletion)
    if (completed == true) return "RETURN_COMPLETE"

    

    return "DONE"
  },

  Activity: async (): Promise<TaskResponse | "PARSED_DATA_NOT_FOUND" | "QUESTS_NOT_FOUND" | "INVALID_QUEST_DATA" | "NO_TAB_ID"> => {
    const completed = await Storage.get(StorageKeys.ActivitiesCompletion)
    if (completed == true) return "RETURN_COMPLETE"

    const pageData = (await fetchPage()).html
    if (!pageData) return "PARSED_DATA_NOT_FOUND"

    const arr = Array.isArray
    const activities = await parseData(pageData, "MoreActivities")
    const dailyset = await parseData(pageData, `"type":"dailyset"`)

    const questList = {
      daily: dailyset.model.dailySetItems,
      activities: (activities.children as Array<Record<string, any>>)?.at(-1)?.activityCards
    }

    // validate data
    if (!questList.daily || !questList.activities) return "QUESTS_NOT_FOUND"
    if (!arr(questList.daily) || !arr(questList.activities)) return "INVALID_QUEST_DATA"

    // bimbimbabmbam
    const combinedList = [...questList.daily, ...questList.activities]
    const unlockedQuests = combinedList.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    const formattedList = unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))

    if (formattedList.length < 1) return "DONE_CONFIRMED"
    
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
    const fetched = await fetch('https://rewards.bing.com/dashboard', PageData[0]);
    const pageData = await fetched.text()

    if (!pageData) return "PARSED_DATA_NOT_FOUND"

    const parser = new DOMParser()
    const doc = parser.parseFromString(pageData, 'text/html')

    const p_text = doc.querySelectorAll(`div.flex.grow.items-center.gap-2 div.flex p.text-pageHeader`)[1];
    const points = Number(p_text)

    if (points > 0) {
      const rewardTab = await chrome.tabs.create({ url: "https://rewards.bing.com/dashboard", active: !1 }); if (!rewardTab.id) return "NO_TAB_ID"
      await sleep(3 * 1000);

      await chrome.tabs.sendMessage(rewardTab.id, {
        type: "CHANGE_TITLE",
        value: "Claiming extra points – Do not close"
      })

      await chrome.tabs.sendMessage(rewardTab.id, {
        type: "CLAIN_POINTS"
      })
      
      
      await sleep(2000)
      await chrome.tabs.remove([rewardTab.id])
    }
  }
}

/// =============================================================================== ///
/// INITALIZATION OF ALARMS, STARTUP AND INSTALLATION OF EXTENSIONS
/// =============================================================================== ///

const init = async () => {
  const todaydate = await Storage.get(StorageKeys.Today) as QuestDateFormat

  // if its not today then kaboom
  if (todaydate !== date()) {
    Storage.set(StorageKeys.Today, date())
    Storage.set(StorageKeys.ActivitiesCompletion, false)
    Storage.set(StorageKeys.SearchCompletion, false)
  }

  // setup some stupid alarms
  chrome.alarms.create("searches", { periodInMinutes: 3.8 })
  chrome.alarms.create("quests", { periodInMinutes: 1 })
  chrome.alarms.create("extra", { periodInMinutes: 7.5 })

  // bimbimbambam
  await sleep(2000)
  Task.Activity().then(id=>{if(id=="DONE_CONFIRMED")chrome.alarms.clear("quests")})
  Task.Search().then(id=>{if(id=="DONE_CONFIRMED")chrome.alarms.clear("searches")})
  Task.EarnPoints()
}

// the events
chrome.runtime.onStartup.addListener(() => init())
chrome.runtime.onInstalled.addListener(() => init())
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "searches") Task.Search()
  if (alarm.name === "quests") Task.Activity()
  if (alarm.name === "extra") Task.EarnPoints()
})

// OPTIONAL INFORMER
console.warn("You can remove this message – If you encounter a bug that persist, please report at https://ocean102.is-a.dev, your help is appreciated. Thank you!")