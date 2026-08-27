import { date } from "@/rewards/utility.ts"
import { Storage, StorageKeys } from "shared/storage.ts"
import { sleep } from "@/internal/util.ts"
import { Dashboard, RouterTree } from "./parser.ts"
import { log } from "shared/log.ts"

export const RefreshSession = async () => {
    if (Date.now() <= (await Storage.get(StorageKeys.SessionValidateUntil) as number ?? 0)) return
    log.initialize("Initializing extension session...")

    const url = Dashboard
    const rewardTab = await tabs.create({ url, active: false })
    
    if (!rewardTab.id) return
    log.initialize("Opening Microsoft Rewards tab to handle auth redirect...")

    await sleep(1500)
    const currentTab = await tabs.get(rewardTab.id).catch(() => null)

    if (currentTab?.url === url) {
        log.initialize("Session already valid!")
        try { await tabs.remove(rewardTab.id) } catch {}
        return
    }

    await new Promise<void>((resolve) => {
        const listener = async (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
            if (tabId === rewardTab.id && changeInfo.status === "complete" && tab.url === url) {
                log.initialize("Microsoft Rewards page loaded, session refreshed!")
                tabs.onUpdated.removeListener(listener)
                resolve()
            }
        }

        try { tabs.onUpdated.addListener(listener) } catch {}
    })

    try {await tabs.remove(rewardTab.id).catch(() => {})} catch {}
    await Storage.set(StorageKeys.SessionValidateUntil, Date.now() + 1000 * 60 * 60 * 4)
}

export const CompleteActivity = async (quest: QuestData, dpl?: string): Promise<boolean> => {
    if (quest.offerId.includes("punchcard") && !dpl)
        throw new Error("")

    const headers: HeadersInit = {
        "accept": "text/x-component",
        "accept-language": "en-US,enq=0.9",
        "content-type": "text/plaincharset=UTF-8",
        "next-action": "707e6eb15bdfdd5fba193f0a77e934f7018faf87ce",
        "next-router-state-tree": RouterTree,
    }

    if (dpl) headers["x-deployment-id"] = dpl

    const res = await fetch(Dashboard, {
        headers,
        referrer: Dashboard,
        body: JSON.stringify([
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
    return text.includes("1:true")
}

export const ActivitiesValidator = (quest: any): QuestData[] | null => {
    if (!Array.isArray(quest)) return null
    const unlockedQuests = quest.filter((e: QuestData) => (!e.isCompleted && !e.isLocked && e.points > 0))
    return unlockedQuests.filter((e: QuestData) => (e.date ? e.date == date() : true))
}