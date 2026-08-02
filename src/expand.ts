export const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
export const sleep = (m: number) => new Promise(r => setTimeout(r, m))

export const log = {
  mobile_search: (...args: any[]) => console.log("[mobile_search]",...args),
  pc_search: (...args: any[]) => console.log("[pc_search]",...args),
  activities: (...args: any[]) => console.log("[activities]",...args),
  claim_points: (...args: any[]) => console.log("[claim_points]",...args),
  initlialize: (...args: any[]) => console.log("[initialize]",...args),
  bg: (...args: any[]) => console.log("[service_worker]",...args),
  tab: (...args: any[]) => console.log("[tabs]",...args),
  task: (...args: any[]) => console.log("[task_handler]",...args),
  quests: (...args: any[]) => console.log("[quests]",...args),
}

const description = chrome.runtime.getManifest().description ?? ""
export const has_tag = (tag: string) => description.includes(tag) && description.includes("debug_tag:")