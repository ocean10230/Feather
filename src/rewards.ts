import { GetSearches, pcall } from "./utility"
import { log, randomHex, sleep } from "./expand"

export const reportSearch = async(query: string) => {
  const [res, suc] = await pcall(async () => {
    log.activities(`Reporting search "${query} to Microsoft's API for points"`)
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
export const parseData = async (data?: string, keyword?: string): Promise<any | null> => {
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
    let json: string = match[0].replace(/"\$undefined"/g, "null")

    try {
      const parsed = JSON.parse(json)
      return parsed?.[3] ?? null
    } catch (e) {
      console.warn("Parse failed:", e)
      return null
    }
  })

  if (suc) return res
  else console.error('Failed to parse NextJS flight data:', res)
}

export const postQuest = async (tabid: number, quest: QuestData) =>
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

export const RefreshSession = async () => {
  console.error("Initialization requires refreshing token (as the website sometime will redirect to the auth portal), this will take sometimes. Thank you")
  log.initlialize("Initializing extension...")

  const url = "https://rewards.bing.com/dashboard"
  const rewardTab = await chrome.tabs.create({ url, active: !1 });
  log.tab("Opening Microsoft Rewards to prevent random forced authentication redirection...")

  await sleep(1500)
  let match = true

  chrome.tabs.get(rewardTab.id!, async (tab) => {
    if (tab.url != url) {
      match = false
    }
  })

  if (!match) {
    if (!rewardTab.id) return;
    try { await chrome.tabs.sendMessage(rewardTab.id, { type: "CHANGE_TITLE", value: "Refreshing automation session" }) } catch {}
    await sleep(15*1000)
    try { await chrome.tabs.remove([rewardTab.id]) } catch {}
  }

  log.initlialize("Finished initial step initialization")
  return new Promise(r => setTimeout(r,1))
}

export const searches: string[] = GetSearches()