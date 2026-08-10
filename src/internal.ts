import { Storage } from "./rewards/utility"

export const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
export const sleep = (m: number) => new Promise(r => setTimeout(r, m))

const og_log = console.log
const og_error = console.error
globalThis.console_color = globalThis.console_color || {}

export const InitConsole = async () => {
  if (globalThis.console_init) return

  const keys = [
    "Searches",
    "Activities",
    "Points",
    "Initialize",
    "TaskHandler",
    "Quests",
    "Error"
  ]

  const colors = (await Promise.all(
    keys.map((key) => Storage.get(`ConsoleColors_${key}`))
  )) as string[]

  keys.forEach((key, index) => {
    globalThis.console_color[key] = colors[index] || "#fff"
  })

  globalThis.console_init = true
}

const formatPrefix = (label: string, color: string) => [
  `%c${label}`,
  `background: #222; padding: 4px; border-radius: 10px; border: 1px solid #ffffff90; color: ${color}; font-weight: bold;`
]

export const log = {
  searches: (...args: any[]) => og_log.apply(console, [...formatPrefix("Searches", globalThis.console_color.Searches), ...args]),
  activities: (...args: any[]) => og_log.apply(console, [...formatPrefix("Activities", globalThis.console_color.Activities), ...args]),
  points: (...args: any[]) => og_log.apply(console, [...formatPrefix("ClaimPoints", globalThis.console_color.Points), ...args]),
  initialize: (...args: any[]) => og_log.apply(console, [...formatPrefix("Initialize", globalThis.console_color.Initialize), ...args]),
  task: (...args: any[]) => og_log.apply(console, [...formatPrefix("TaskHandler", globalThis.console_color.TaskHandler), ...args]),
  quests: (...args: any[]) => og_log.apply(console, [...formatPrefix("Quests", globalThis.console_color.Quests), ...args]),
  error: (...args: any[]) => og_error.apply(console, [...formatPrefix("Error", globalThis.console_color.Error || "#ff5555"), ...args])
}