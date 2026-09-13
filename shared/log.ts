const logger = console.log
const og_error = console.error

export const log = {
  searches: (...args: any[]) => logger.apply(console, ["[Searches]", ...args]),
  activities: (...args: any[]) => logger.apply(console, ["[Activities]", ...args]),
  points: (...args: any[]) => logger.apply(console, ["[Claiming]", ...args]),
  initialize: (...args: any[]) => logger.apply(console, ["[Initialize]", ...args]),
  task: (...args: any[]) => logger.apply(console, ["[Handler]", ...args]),
  quests: (...args: any[]) => logger.apply(console, ["[Quests]", ...args]),
  error: (...args: any[]) => og_error.apply(console, ["[Error]", ...args])
}