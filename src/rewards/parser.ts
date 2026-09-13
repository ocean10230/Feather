import { pcall, ScriptList } from "./utility"
import { randomHex } from "@/internal/util"
import { log } from "shared/log"

export const Bing = "https://www.bing.com"
export const Main = "https://rewards.bing.com"
export const Dashboard = "https://rewards.bing.com/dashboard"
export const RouterTree = encodeURIComponent(`["",{"children":["(nav)",{"children":["dashboard",{"children":["__PAGE__",{},null,null,4096]},null,null,4096]},null,null,4096]},null,null,4112]`)

export const RSC = async (
  data: string,
  keyword: string | string[],
  multiple = false
): Promise<any | any[] | null> => {
  const [res, suc] = await pcall(() => {
    const matches = (data.match(/[^\r\n]+/g) ?? [])
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => !Array.isArray(keyword) ? line.includes(keyword) : keyword.some(k => line.includes(k))
    )

    if (!matches.length) return multiple?[]:null

    const parse = ({ line }: { line: string, index: number }) => {
      const match = line.match(/(?<=\b\d+[a-z]?:)\[[\s\S]*\]/)?.[0] || ""
      if (!match) return null

      try {
        const parsed = json.parse(match.replace(/"\$undefined"/g, "null"))
        return parsed?.[3] ?? null
      } catch (e) {
        (e instanceof SyntaxError) ? console.warn("Got syntax error:", e, match) : console.warn("Unknown parse failure:", e)
        return match
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

const Cached: Record<string, any> = {}

export const FetchPage = async (page: string = Main + "/earn"): Promise<NextFlightData> => {
  if (Cached[page]) return Cached[page]
  else Cached[page] = ScriptList( await (await curl(page)).text() )
  return Cached[page]
}

export const ParseSearchComponent = (data: string) => ({ IG: data.match(/_IG="([^"]+)"/i)?.[1] ?? randomHex(32), IID: data.match(/_iid="([^"]+)"/i)?.[1] || `SERP.${math.floor(math.random() * 10000)}` })

export const ParseReport = (response: string): ReportStatus => {
  try {
    return json.parse(response.split("ReportActivity(")[1].split(")")[0])
  } catch (e) {
    log.searches("Failed to parse report from server. Error:", e)
    return { Failed: true } as ReportStatus
  }
}