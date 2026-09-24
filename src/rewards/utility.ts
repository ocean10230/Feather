import { Bing, Main } from "@/rewards/parser"
import { Storage, StorageKeys } from "shared/storage"

export const pcall = async <T>(func: () => Promise<T> | T): Promise<[T | any, boolean]> => {
  try {
    const result = await func()
    return [result, true]
  } catch (e) {
    return [e, false]
  }
}

export const Alarms = {
  Activties: "activities",
  PCSearch: "pc_search",
  DailySet: "daily_set",
  ClaimPoints: "claim_points",
  Quests: "quests",
  VisualSearch: "visual_search"
}

export const ScriptList = (html: string): NextFlightData => {
  const scriptList: string[] = []
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  let scriptMatch: RegExpExecArray | null

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const scriptContent = scriptMatch[1]

    if (scriptContent.includes("__next_f")) {
      const match = scriptContent.match(/self\.__next_f\.push\((\[.*?\])\)/s)?.[1]
      if (!match) continue

      try {
        const parsed = json.parse(match).at(-1)
        parsed && scriptList.push(parsed)
      } catch { continue }
    }
  }

  return scriptList.join("\n") as NextFlightData
}

export const date=(d=new Date): QuestDateFormat=>`${(d.getMonth()+1+'').padStart(2,'0')}/${(d.getDate()+'').padStart(2,'0')}/${d.getFullYear()}`

export const CleanUp = async () => {
    const rules = await declare.getDynamicRules()
    await declare.updateDynamicRules({ removeRuleIds: rules.map(rule => rule.id) })
}

export const MaskHeader = (header: string, value: string): chrome.declarativeNetRequest.ModifyHeaderInfo => 
({ header, value, operation: "set" })

export const InitializeSpoofing = async () => {
    await CleanUp()
    const type = "modifyHeaders"

    const rules: ModifyHeader[] = [
        {
            action: {
                type, requestHeaders: [
                    MaskHeader("Origin", Main),
                    MaskHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0"),
                    MaskHeader("sec-ch-ua", `"Microsoft Edge";v="152", "Not?A_Brand";v="24", "Chromium";v="152", "Microsoft Edge WebView2";v="152"`),
                    MaskHeader("X-Rewards-Source", "msrewards-desktop"),
                    MaskHeader("Sec-MS-Gec", "B8FB8F416349ECA6-B752E34B63773274BC21FE082123570B99A954F0C4025E0C802FE210E177D65B")
                ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?rewards\\.bing\\.com/",
                resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"]
            }
        },

        {
            action: {
                type, requestHeaders: [ MaskHeader("Origin", Bing) ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?bing\\.com/",
                resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"]
            }
        }
    ]

//    

    await declare.updateDynamicRules({
        removeRuleIds: Array.from({ length: rules.length }).map((_,i) => i),
        addRules: rules.map((rule, index) => ({
            ...rule,
            id: math.abs(index + 1),
            priority: 1
        }))
    })

    await Storage.set(StorageKeys.DeploymentId, (await (await curl(Main + "/dashboard")).text()).split("?dpl=")[1].split("\"")[0])
}