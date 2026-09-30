import { pcall, randomHex } from "@/helpers/utility"
import { log } from "@/helpers/debugging"

export const Bing = "https://www.bing.com"
export const Main = "https://rewards.bing.com"
export const Dashboard = "https://rewards.bing.com/dashboard"
export const RouterTree = encodeURIComponent(`["",{"children":["(nav)",{"children":["dashboard",{"children":["__PAGE__",{},null,null,4096]},null,null,4096]},null,null,4096]},null,null,4112]`)

export const ScriptList = (html: string): NextFlightData => {
  const scriptList: string[] = []
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi
  let scriptMatch: RegExpExecArray | null

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const scriptContent = scriptMatch[1]

    if (scriptContent.includes("__next_f")) {
      const match = scriptContent.match(/self\.__next_f\.push\((\[.*?\])\)/s)?.[1]
      if (!match) continue

      try {
        const parsed = JSON.parse(match).at(-1)
        parsed && scriptList.push(parsed)
      } catch { continue }
    }
  }

  return scriptList.join("\n") as NextFlightData
}

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
        const parsed = JSON.parse(match.replace(/"\$undefined"/g, "null"))
        return parsed?.[3] ?? null
      } catch (e) {
        (e instanceof SyntaxError) ? log.error("Got syntax error:", e, match) : log.error("Unknown parse failure:", e)
        return match
      }
    }

    return multiple
      ? matches.map(parse).filter(v => v != null)
      : parse(matches[0])
  })

  if (suc) return res

  log.error("Failed to parse NextJS flight data:", res)
  return multiple ? [] : null
}

export const FetchPage = async (page: string = Main + "/earn"): Promise<NextFlightData> => ScriptList( await (await curl(page)).text() )

export const ParseSearchComponent = (data: string) => ({
  IG: data.match(/_IG="([^"]+)"/i)?.[1] ?? randomHex(32),
  IID: data.match(/_iid="([^"]+)"/i)?.[1] || `SERP.${Math.floor(Math.random() * 10000)}`,
  cvid: data.match(/_cid="([^"]+)"/i)?.[1] ?? randomHex(32),
})

export const ParseReport = (response: string): ReportStatus => {
  try {
    // response.split("ReportActivity(")[1].split(")")[0]
    const match = response.match(/ReportActivity\((.*?)\)/)
    const data = JSON.parse(match ? match[1] : "{}") as ReportStatus
    data.RewardsSessionData.GiveBalance = data.RewardsSessionData.RewardsBalance - data.RewardsSessionData.PreviousBalance
    return data
  } catch (e) {
    log.searches("Failed to parse report from server. Error:", e)
    return { Failed: true } as ReportStatus
  }
}