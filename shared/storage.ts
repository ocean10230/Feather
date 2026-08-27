export const Storage = {
    async get(key: string): Promise<StorageData> {
        return (await chrome.storage.local.get(key))[key] as StorageData
    },
    async set(key: string, value: StorageData): Promise<void> {
        await chrome.storage.local.set({ [key]: value })
    }
}

export const StorageKeys = {
    Today: "Today_Date",

    SearchCompletion: "Today_SearchCompleted",
    ActivitiesCompletion: "Today_ActivitiesCompletion",
    DailySetCompletion: "Today_DailySetCompletion",
    VisualSearchCompletion: "Today_VisualSearchCompletion",

    DeploymentId: "DeploymentId",
    ClaimPointsNextActionId: "ClaimPointsNextActionId",

    QuestsCompletion: "QuestsCompletion",
    ActionCompletionDelay: "QuestsActionCompletionDelayedTo",

    SessionValidateUntil: "SessionValidateUntil",
    RunAfter: "RunAgainAfter"
}