import { Bing, Main } from "./parser"
import { Storage, StorageKeys } from "./storage"

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
            action: { type, requestHeaders: [ MaskHeader("Origin", Main) ] },
            condition: { regexFilter: "^https://(www\\.)?rewards\\.bing\\.com/" }
        },

        {
            action: { type, requestHeaders: [ MaskHeader("Origin", Bing) ] },
            condition: { regexFilter: "^https://vcf.bing.com/" }
        },

        {
            action: { type, requestHeaders: [ MaskHeader("Origin", Bing) ] },
            condition: { regexFilter: "^https://(www\\.)?bing\\.com/" }
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

    const promise = await curl(Main + "/dashboard")
    const text = await promise.text()
    const dpl = text.match(/\?dpl=([^"]+)/)?.[1]
    await Storage.set(StorageKeys.DeploymentId, dpl || "")
}