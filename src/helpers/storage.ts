export const Storage = {
    get: async (key: string): Promise<StorageData> => (await chrome.storage.local.get(key))[key] as StorageData,
    set: async (key: string, value: StorageData): Promise<void> => await chrome.storage.local.set({ [key]: value })
}

export const StorageKeys = {
    Today: "Today_Date",
    SearchCompletion: "Today_SearchCompleted",
    ActivitiesCompletion: "Today_ActivitiesCompletion",
    DailySetCompletion: "Today_DailySetCompletion",
    VisualSearchCompletion: "Today_VisualSearchCompletion",
    DeploymentId: "DeploymentId",
    ClaimPointsNextActionId: "ClaimPointsNextActionId",
    SessionValidateUntil: "SessionValidateUntil",
}