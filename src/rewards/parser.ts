import { pcall, ScriptList } from "./utility"
import { randomHex } from "@/internal/util"
import { log } from "shared/log.ts"

let cached_IID = ""
export const Bing = "https://www.bing.com"
export const Main = "https://rewards.bing.com"
export const Dashboard = "https://rewards.bing.com/dashboard"
export const RouterTree = "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C4096%5D%7D%2Cnull%2Cnull%2C4096%5D%7D%2Cnull%2Cnull%2C4096%5D%7D%2Cnull%2Cnull%2C4112%5D"

export const RSC = async (
  data?: string,
  keyword?: string | string[],
  multiple = false
): Promise<any | any[] | null> => {
  const [res, suc] = await pcall(() => {
    if (!data || !keyword) return null

    const list = data.match(/[^\r\n]+/g) ?? []
    const matches = list
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => {
        if (!Array.isArray(keyword)) return line.includes(keyword)
        return keyword.some(k => line.includes(k))
    })

    if (!matches.length) return multiple ? [] : null

    const regex = /(?<=\b\d+[a-z]?:)\[[\s\S]*\]/

    const parse = ({ line }: { line: string, index: number }) => {
      const match = line.match(regex)
      if (!match) return null

      const json = match[0].replace(/"\$undefined"/g, "null")

      try {
        const parsed = JSON.parse(json)
        return parsed?.[3] ?? null
      } catch (e) {
        if (e instanceof SyntaxError) {
            console.warn("Got syntax error:", e, json)
        } else {
          console.warn("Unknown parse failure:", e)
        }

        return match[0]
      }
    }

    return multiple
      ? matches.map(parse).filter(v => v != null)
      : parse(matches[0])
  })

  if (suc) return res

  console.error("Failed to parse NextJS flight data:", res)
  return multiple ? [] : null
}

const Cached: Record<string, NextFlightData> = {}

export const FetchPage = async (page: string = Main + "/earn"): Promise<NextFlightData> => {
  if (Cached[page]) return Cached[page]
  else Cached[page] = ScriptList( await (await fetch(page)).text() )
  return Cached[page]
}

export const ParseSearchComponent = (data: string) => {
  const IG = data.match(/_IG="([^"]+)"/i)?.[1] ?? randomHex(32)
  const IID = cached_IID || data.match(/_iid="([^"]+)"/i)?.[1] || `SERP.${Math.floor(Math.random() * 10000)}`
  cached_IID = IID

  return { IG, IID }
}

export const ParseReport = (response: string): ReportStatus => {
  try {
    return JSON.parse(response.split("ReportActivity(")[1].split(")")[0])
  } catch (e) {
    log.searches("Failed to parse report from server. Error:", e)
    return { Failed: true } as ReportStatus
  }
}