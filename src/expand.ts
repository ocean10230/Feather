export const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export const secureRandom = (min: number, max: number): number => {
  const range = max - min + 1;
  const maxUint32 = 0xFFFFFFFF;
  const limit = maxUint32 - (maxUint32 % range);
  const array = new Uint32Array(1);
  do { crypto.getRandomValues(array); } while (array[0] >= limit);
  return min + (array[0] % range);
}

export const log = {
  mobile_search: (...args: any[]) => console.log("[mobile_search]",...args),
  pc_search: (...args: any[]) => console.log("[pc_search]",...args),
  activities: (...args: any[]) => console.log("[activities]",...args),
  claim_points: (...args: any[]) => console.log("[claim_points]",...args),
  initlialize: (...args: any[]) => console.log("[initialize]",...args),
  bg: (...args: any[]) => console.log("[service_worker]",...args),
  tab: (...args: any[]) => console.log("[tabs]",...args),
  task: (...args: any[]) => console.log("[task_handler]",...args),
};

const description = chrome.runtime.getManifest().description ?? "";
export const has_tag = (tag: string) => {
  return description.includes(tag) && description.includes("debug_tag:");
};