declare type TaskResponse = "DONE" | "DONE_CONFIRMED" | "RETURN_COMPLETE"
declare type AcceptedStorageData = string | number | Record<any, any> | Array<any> | boolean
declare type NextFlightData = `${string}:${string}`
declare type QuestDateFormat = `${string}/${string}/${string}`
declare type None = undefined | null | void | "$undefined"
declare type QuestData = {
  hash: string
  title: string
  points: number
  offerId: string
  isCompleted: boolean
  isLocked: boolean
  date?: QuestDateFormat
  isPromotional: boolean | `$undefined`
}

declare type AutomationResponse = "DONE" | "DONE_CONFIRMED" | "UNKNOWN_ERROR" | "FAILED_COMPLETELY"