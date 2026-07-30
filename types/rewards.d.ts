declare type NextFlightData = `${string}:${string}`
declare type QuestDateFormat = `${string}/${string}/${string}`

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