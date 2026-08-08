export const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
export const sleep = (m: number) => new Promise(r => setTimeout(r, m))

export const log = {
  searches: (...args: any[]) => console.log("[search]",...args),
  activities: (...args: any[]) => console.log("[activities]",...args),
  claim_points: (...args: any[]) => console.log("[claim_points]",...args),
  initlialize: (...args: any[]) => console.log("[initialize]",...args),
  task: (...args: any[]) => console.log("[task_handler]",...args),
  quests: (...args: any[]) => console.log("[quests]",...args),
  visual_search: (...args: any[]) => console.log("[visual_search]",...args)
}