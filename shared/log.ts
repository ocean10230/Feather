const og_log = console.log
const og_error = console.error

export const log = {
  searches: (...args: any[]) => og_log.apply(console, ["[Searches]", ...args]),
  activities: (...args: any[]) => og_log.apply(console, ["[Activities]", ...args]),
  points: (...args: any[]) => og_log.apply(console, ["[Claiming]", ...args]),
  initialize: (...args: any[]) => og_log.apply(console, ["[Initialize]", ...args]),
  task: (...args: any[]) => og_log.apply(console, ["[Handler]", ...args]),
  quests: (...args: any[]) => og_log.apply(console, ["[Quests]", ...args]),
  error: (...args: any[]) => og_error.apply(console, ["[Error]", ...args])
}