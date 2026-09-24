import { log } from "shared/log"
import { date } from "@/rewards/utility"
import { sleep } from "@/internal/util"
import { Storage, StorageKeys } from "shared/storage"
import { Dashboard, RouterTree } from "@/rewards/parser"

export const RefreshSession = async () => {
    if (Date.now() <= (await Storage.get(StorageKeys.SessionValidateUntil) as number ?? 0)) return
    log.initialize("Initializing session")

    const url = Dashboard
    const rewardTab = await tabs.create({ url, active: false })
    if (!rewardTab.id) return
    
    log.initialize("Handling auth request")
    await sleep(1500)

    if ((await tabs.get(rewardTab.id))?.url === url) {
        log.initialize("Session already valid!")
        tabs.remove(rewardTab.id)
        return
    }

    await new Promise<void>((resolve) => {
        const listener = async (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
            if (tabId === rewardTab.id && changeInfo.status === "complete" && tab.url === url) {
                log.initialize("Session renewed!")
                tabs.onUpdated.removeListener(listener)
                resolve()
            }
        }

        tabs.onUpdated.addListener(listener)
    })

    await tabs.remove(rewardTab.id)
    await Storage.set(StorageKeys.SessionValidateUntil, Date.now() + 1000 * 60 * 60 * 4)
}

export const CompleteActivity = async (quest: QuestData, dpl?: string): Promise<boolean> => {
    if (quest.offerId.includes("punchcard") && !dpl) throw new Error("")

    const res = await curl(Dashboard, {
        headers: {
            "accept": "text/x-component",
            "content-type": "text/plaincharset=UTF-8",
            "next-action": "707e6eb15bdfdd5fba193f0a77e934f7018faf87ce",
            "next-router-state-tree": RouterTree,
            "x-deployment-id": dpl
        } as HeadersInit, referrer: Dashboard,
        body: json.stringify([
            quest.hash, 11, {
                isPromotional: "$undefined", offerid: quest.offerId,
                timezoneOffset: String(new Date().getTimezoneOffset())
            }
        ]),
        method: "POST",
        mode: "cors",
        credentials: "include"
    })

    const text = await res.text()
    return text.includes("true")
}

export const ActivitiesValidator = (quest: any): QuestData[] | null => {
    if (!Array.isArray(quest)) return null
    return quest.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0 && e.date ? e.date == date() : true))
}