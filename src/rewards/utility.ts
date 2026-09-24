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
    const resourceTypes: resourceTypes = ["main_frame", "sub_frame", "xmlhttprequest", "other"]

    const rules: ModifyHeader[] = [
        {
            action: {
                type, requestHeaders: [
                    MaskHeader("Origin", Main)
                ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?rewards\\.bing\\.com/"
            }
        },

        {
            action: {
                type, requestHeaders: [ MaskHeader("Origin", Bing) ]
            },
            condition: {
                regexFilter: "^https://vcf.bing.com/"
            }
        },

        {
            action: {
                type, requestHeaders: [ MaskHeader("Origin", Bing) ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?bing\\.com/"
            }
        }
    ]

    await declare.updateDynamicRules({
        removeRuleIds: Array.from({ length: rules.length }).map((_,i) => i),
        addRules: rules.map(({action, condition}, index) => ({
            action, condition: {
                ...condition,
                resourceTypes
            },
            id: index + 1,
            priority: 1
        }))
    })

    await Storage.set(StorageKeys.DeploymentId, (await (await curl(Main + "/dashboard")).text()).split("?dpl=")[1].split("\"")[0])
}