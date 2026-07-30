export const Storage = {
  async get(key: string): Promise<StorageData> { return (await chrome.storage.local.get(key))[key] as StorageData },
  set(key: string, value: StorageData) {return chrome.storage.local.set({ [key]: value })}
}

export const StorageKeys = {
    Today: "Today_Date",
    SearchCompletion: "Today_SearchCompleted",
    MobileSearchCompletion: "Today_MobileSearchCompleted",
    ActivitiesCompletion: "Today_ActivitiesCompletion",

    MobileSearchRulesetId: "MobileSearchRulesetId",
    ClaimPointsRulesetId: "ClaimPointsRulesetId",
    RulesetIdsInitialized: "RulesetIdsInitialized",

    SearchList: "SearchList",
    SearchListGenerated: "SearchListGenerated",
    SearchListLength: "SearchListLength",

    WebpackBundleCache: "WebpackBundleCache",
    WebpackVersion: "WebpackDeploymentId",
    DeploymentId: "DeploymentId",
    ClaimPointsNextActionId: "ClaimPointsNextActionId",
}

export const GetSearches = () => {
    const data: string[] = [];

    const year = new Date().getFullYear()

    const games = ['resident evil','roblox','gta','gta v','gta iv','gta sa','gta liberty city','gta vc','gta vc stories','gta iii','gta ii','gta i','forza','forza 5','forza 6','ets2','csgo','cs source','cod','rdr','rdr2','gta+','gamepass','xbox','minecraft','robux','roblox pets','world of warcraft','final fantasy','guild wars','lol','dota 2','the sims 4','animal crossing','stardew valley','cyberpunk 2077','elden rings','witcher 3','super smash bros','brawlhalla','fortnite','apex legends','valorant','battlefield 2042','spellforce arena','black desert online','runescape','maple story','phantasy star online 2','smite','heroes of the storm','mobile legends','vainglory','arena of valor','crystal of atlan','terraria','garden paws','eco','my time at portia','skyrim','horizon forbidden west','diablo 4','geometry dash','gta online','hollow knight','silksong','hollow knight silksong','internet cafe simulator','subnautica','subnautica below zero','ark survival evolved','the forest','the long dark','no mans sky','sea of thieves','valheim','rust','7 days to die','dayz','fall guys','among us']
    const socialMedias = ["facebook","instagram","twitter","tiktok","snapchat","linkedin","youtube","reddit","pinterest","tumblr","discord","twitch","clubhouse","mastodon","bluesky","threads","wechat","qq","qzone","line","kakaotalk","viber","telegram","signal","whatsapp","messenger","weibo","douyin","vk","odnoklassniki","mixi","baidu tieba","nextdoor","peach","ello","diaspora","minds","steemit","gab","parler","truth social","gettr","rumble","mewe","yubo","caffeine","dlive","trovo","bitchute","vimeo","flickr","deviantart","dribbble","behance","goodreads","letterboxd","anilist","myanimelist","gaia online","habbo hotel","imvu","second life","roblox","steam community","epic games social","battle.net","xbox live","playstation network","newgrounds","soundcloud","bandcamp","audius","last.fm","reverbnation","mixcloud","kik","amino","fanpop","ravelry","couchsurfing","meetup","care2","researchgate","academia.edu","stack overflow","github","gitlab","codepen","dev.to","hashnode","product hunt","angel list","indie hackers","quora","medium","substack","kickstarter","gofundme","patreon","go fund me"]
    const gamesWithMaps = ["minecraft","elden ring","skyrim","gta v","sea of thieves","among us","ark: survival evolved","rust","valheim","terraria","no man's sky","subnautica","the forest","dayz","7 days to die","apex legends","fortnite","battlefield 2042","dota 2","league of legends","smite","world of warcraft","final fantasy xiv","guild wars 2","black desert online","runescape","path of exile","diablo iv","monster hunter world","far cry 6","just cause 4","watch dogs 2","cyberpunk 2077","geometry dash","gta san andreas","gta vice city","gta iv","gta iii","forza horizon 5","ets2","red dead redemption 2"]
    const toBe = ["successful","productive","good at something","cool","rich","a billionare","a millionare","a trillionare","rich guy","motivated","sigma","gooning","touching grass"]

    const expand = (
        items: string[],
        bases: ((s: string) => string)[],
        extra: ((s: string) => string)[] = []
    ): string[] =>
    items.flatMap(i => [
        ...bases.map(b => b(i)),
        ...bases.map(b => `${b(i)} ${year}`),
        ...bases.map(b => `${b(i)} in ${year}`),
        ...extra.map(b => b(i))
    ])

    const gameBases: ((g: string) => string)[] = [
        g=>g, g=>`${g} giveaway`,g=>`${g} tips`,g=>`${g} tricks`,
        g=>`${g} best mods`, g=>`${g} best glitches`, g=>`${g} best money trick`,
        g=>`${g} download`,g=>`${g} download tutorial`, g=>`${g} cheats`,g=>`${g} hacks cheats`,
        g=>`${g} cheats hacks`, g=>`${g} cheats`, g=>`${g} external cheats`, g=>`${g} trainers`
    ]

    const gameExtra: ((g: string) => string)[] = [ g => `how to download ${g}`, g => `how to get ${g}`, g => `how to play ${g}` ]
    const mapBases: ((g: string) => string)[] = [ g => `${g} map`, g => `${g} maps`, g => `${g} best map`, g => `${g} best maps` ]

    const socialBases: ((s: string) => string)[] = [
        s => s, s => `wtf is ${s}`,
        s => `what is ${s}`, s => `who founded ${s}`,
        s => `when was ${s} founded`, s => `explain how ${s} works im a caveman`,

        s => `how to get rid of stupid people on my comment section on ${s}`,
        s => `how do i get rid of stupid people on my comment section on ${s}`,

        s => `why does ${s} suck`,
        s => `is ${s} dead`,
        s => `is ${s} worth using`,
        s => `why is everyone using ${s}`,
        s => `how do i stop using ${s}`,

        s => `how to get more ${s} followers`,
        s => `how to get more ${s} audiences`,
        s => `how to get more ${s} subscribers`,
        s => `how to get more ${s} views`,

        s => `how to get more audience on ${s}`,
        s => `how to get more views on ${s}`,

        s => `how to go viral on ${s}`,
        s => `best ${s} alternatives`,
        s => `best ${s} tips`,
        s => `best ${s} tricks`,
        s => `best ${s} hacks`,

        s => `best way to get followers ${s}`,
        s => `best way to get likes ${s}`,
        s => `best way to get viral videos ${s}`,
        s => `best way to get more audience ${s}`,

        s => `how to use ${s} effectively`,
        s => `how to use ${s} safely`,
        s => `how to use ${s} for marketing`,
        s => `how to use ${s} for advertising`,

        s => `how to deal with stupid people on ${s}`,
        s => `best way to deal with stupid people on ${s}`,
        s => `how to recover from doomscrolling on ${s}`
        ]

        const beingBases: ((g: string) => string)[] = [
        g => `smart ways to be ${g}`, g => `best way to be ${g}`,
        g => `how to be ${g}`, g => `how to actually be ${g}`,
        g => `pros of being ${g}`, g => `how hard is it to be ${g}`
    ]

    data.push(
        ...expand(games, gameBases, gameExtra),
        ...expand(socialMedias, socialBases),
        ...expand(gamesWithMaps, [...mapBases, ...gameBases], gameExtra),
        ...toBe.flatMap(b => beingBases.map(fn => fn(b)))
    )

    return data
}

// i love lua
export const pcall = async <T>(func: () => Promise<T> | T): Promise<[T | any, boolean]> => {
  try {
    const result = await func()
    return [result, true]
  } catch (e) {
    return [e, false]
  }
}

export const Alarms = {
  Activties: "activities",
  PCSearch: "pc_search",
  MobileSearch: "mobile_search",
  ClaimPoints: "claim_points"
}

export const Message = `[ \${extension_name} \${extension_version} ] – [ Note ]
This extension is built purely with dedication and does not collect any data for analysis/purposes.
If you encounter any issue, please DM me @ocean10230, your help is appreciated. Thank you!
`

import { DOMParser } from "linkedom"

export const ScriptList = (html: string): NextFlightData => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const scripts = doc.querySelectorAll("script")
  const scriptList: NextFlightData[] = []
  
  scripts.forEach((element: HTMLScriptElement) => {
    if (element.innerHTML.includes("__next_f")) {
      const str = element.innerHTML
      const match = str.match(/self\.__next_f\.push\((\[.*?\])\)/s)

      if (!match) return
      const dataString = match[1]

      if (!dataString) return
      scriptList.push(JSON.parse(dataString).at(-1))
    }
  })

  return scriptList.join("\n") as NextFlightData
}

export const date=(d=new Date):QuestDateFormat=>`${(d.getMonth()+1+'').padStart(2,'0')}/${(d.getDate()+'').padStart(2,'0')}/${d.getFullYear()}`

import { log } from "@/expand"

    export const CleanUp = async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules()
    const ruleIds = rules.map(rule => rule.id)
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds })
    log.initlialize("Cleaned up old rules:", ruleIds)
}

export const InitializeSpoofing = async () => {
    log.initlialize("Creating new rules to spoof origin")

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [100], 
        addRules: [
            {
                id: 100,
                priority: 1,
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [
                        {
                            header: "Origin",
                            operation: "set",
                            value: "https://rewards.bing.com/"
                        }
                    ]
                },
                condition: {
                    urlFilter: "||bing.com", // Matches all URLs. Narrow this down if you only want specific sites.
                    resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"] // Target pages and network fetches
                }
            }
        ]
    })
}