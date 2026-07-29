declare type StorageData = string | number | Record<any, any> | Array<any> | boolean
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
  isPromotional: boolean | None
}

declare enum TaskResponse {
  Done = 0, Confirm, UnknownError, GenerationFailure,
  ParseFailure, Disabled, InvalidInformation,
  BrowserError, Ignored
}

declare type TaskRegistration = {
  handler: () => Promise<TaskResponse | string>,
  name: string,
  interval: number,
  done?: boolean,
  ignorance_tags?: string[],
  disabled?: boolean,
  disable_logs?: boolean
}