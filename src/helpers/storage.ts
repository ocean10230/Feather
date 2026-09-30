export const Storage = {
    get: async (key: string): Promise<StorageData> => (await chrome.storage.local.get(key))[key] as StorageData,
    set: async (key: string, value: StorageData): Promise<void> => await chrome.storage.local.set({ [key]: value })
}

export const StorageKeys = {
    Today: "Today_Date",

    Search: "Today_SearchCompleted",
    Activities: "Today_ActivitiesCompletion",
    DailySet: "Today_DailySetCompletion",
    VisualSearch: "Today_VisualSearchCompletion",
    
    DeploymentId: "DeploymentId",
    ClaimPointsNextActionId: "ClaimPointsNextActionId",
    SessionValidateUntil: "SessionValidateUntil",
}