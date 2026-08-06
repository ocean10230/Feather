import { games, socialMedias, toBe, gamesWithMaps, phones, components_base, hardwareBases } from "./search_generation"

const isExtension = !!chrome.storage

export const Storage = {
    async get(key: string): Promise<StorageData> {
        if (isExtension)
            return (await chrome.storage.local.get(key))[key] as StorageData
        else {
            const data = localStorage.getItem(key) as StorageData
            
            try {
                return JSON.parse(data as string) as StorageData
            }
            catch {
                return data
            }
        }
    },
    async set(key: string, value: StorageData): Promise<void> {
        if (isExtension)
            await chrome.storage.local.set({ [key]: value })
        else {
            try {
                localStorage.setItem(key, JSON.stringify(value))
            }
            catch {
                localStorage.setItem(key, !!value ? String(value) : value as string)
            }
        }
    }
}

export const StorageKeys = {
    Today: "Today_Date",
    SearchCompletion: "Today_SearchCompleted",
    ActivitiesCompletion: "Today_ActivitiesCompletion",
    DailySetCompletion: "Today_DailySetCompletion",
    VisualSearchCompletion: "Today_VisualSearchCompletion",

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

    QuestsCompletion: "QuestsCompletion",
    ActionCompletionDelay: "QuestsActionCompletionDelayedTo",

    SessionValidateUntil: "SessionValidateUntil",
}

export const GetSearches = () => {
    const data: string[] = [];

    const year = new Date().getFullYear()

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
        g=>`${g} download`,g=>`${g} download tutorial`, g=>`${g} cheats`, g=>`${g} cheats`,
        g=>`${g} external cheats`, g=>`${g} trainers`,
        g=>`${g} with cheat engines`, g=>`${g} becnmarks`, g=>`${g} mods`, g=>`${g} essentials`,
        g=>`${g} download free`, g=>`${g} installation guide`, g=>`${g} installi guide`
    ]

    const gameExtra: ((g: string) => string)[] = [ g => `how to download ${g}`, g => `how to get ${g}`, g => `how to play ${g}` ]
    const mapBases: ((g: string) => string)[] = [ g => `${g} map`, g => `${g} maps`, g => `${g} best map`, g => `${g} best maps` ]

    const socialBases: ((s: string) => string)[] = [
        s => `what is ${s}`, s => `who founded ${s}`,
        s => `when was ${s} founded`, s => `explain how ${s} works im a caveman`,

        s => `how to get rid of stupid people on my comment section on ${s}`,
        s => `how do i get rid of stupid people on my comment section on ${s}`,

        s => `why does ${s} suck`,
        s => `is ${s} dead`,

        s => `how to get more ${s} followers`,
        s => `how to get more ${s} audiences`,
        s => `how to get more ${s} views`,

        s => `how to get more audience on ${s}`,
        s => `how to get more views on ${s}`,

        s => `how to go viral on ${s}`,
        s => `best ${s} alternatives`,
        s => `best ${s} tips to go viral`,

        s => `how to use ${s} effectively`,
        s => `how to use ${s} safely`,

        s => `how to deal with stupid people on ${s}`,
        s => `best way to deal with stupid people on ${s}`,
        s => `how to recover from doomscrolling on ${s}`
    ]

    const beingBases: ((g: string) => string)[] = [
        g => g, g => `smart ways to be ${g}`, g => `best way to be ${g}`,
        g => `how to be ${g}`, g => `how to actually be ${g}`,
        g => `pros of being ${g}`, g => `how hard is it to be ${g}`,
        g => `how to be ${g} quickly`, g => `smart and easy ways to be ${g} quickly`
    ]

    const phone_storage_capacity = ["256GB", "512GB"];
    const phone_colors = ["Black", "White"];
    const phone_conditions = ["new", "refurbished"];

    const search_suffixes = [
        "",
        "price", "review", "release date",
        "is still worth buying today",
        "is worth buying nowadays",
    ];

    const phones_related: ((g: string) => string[])[] = [
        g => {
            const results: string[] = [];

            for (const condition of phone_conditions)
            for (const storage of phone_storage_capacity)
            for (const color of phone_colors)
            for (const suffix of search_suffixes) {
                const phone = [
                    condition,
                    g,
                    storage,
                    color,
                ]
                    .filter(Boolean)
                    .join(" ");

                results.push(
                    suffix.startsWith("what is")
                        ? `${suffix} ${phone}`
                        : suffix.startsWith("when was")
                        ? `${suffix} ${phone}`
                        : suffix.startsWith("is ")
                        ? `${suffix} ${phone}`
                        : suffix
                        ? `${phone} ${suffix}`
                        : phone
                );
            }

            return [...new Set(results)];
        },
    ];

    data.push(
        ...expand(games, gameBases, gameExtra),
        ...expand(socialMedias, socialBases),
        ...expand(gamesWithMaps, [...mapBases, ...gameBases], gameExtra),
        ...expand(components_base, hardwareBases),
        ...toBe.flatMap(b => beingBases.map(fn => fn(b))),
        ...phones.flatMap(phone => phones_related.map(f => f(phone)).flat())
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
  DailySet: "daily_set",
  ClaimPoints: "claim_points",
  Quests: "quests",
  VisualSearch: "visual_search"
}

export const Message = "[ \${extension_name} \${extension_version} ] – [ Note ]\nThis extension is built purely with dedication and does not collect any data for analysis/purposes.\nIf you encounter any issue, please DM me @ocean10230, your help is appreciated. Thank you!"

export const ScriptList = (html: string): NextFlightData => {
  const scriptList: string[] = [];
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const scriptContent = scriptMatch[1];

    if (scriptContent.includes("__next_f")) {
      const match = scriptContent.match(/self\.__next_f\.push\((\[.*?\])\)/s);

      if (!match || !match[1]) continue;

      try {
        const parsedArray = JSON.parse(match[1]);
        const lastItem = parsedArray[parsedArray.length - 1];

        if (lastItem) {
          scriptList.push(lastItem);
        }
      } catch {
        continue;
      }
    }
  }

  return scriptList.join("\n") as NextFlightData;
};

export const date=(d=new Date): QuestDateFormat=>`${(d.getMonth()+1+'').padStart(2,'0')}/${(d.getDate()+'').padStart(2,'0')}/${d.getFullYear()}`

import { log } from "@/expand"

export const CleanUp = async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules()
    const ruleIds = rules.map(rule => rule.id)
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ruleIds })
    log.initlialize("Cleaned up old rules:", ruleIds)
}

export const MaskHeader = (header: string, value: string): chrome.declarativeNetRequest.ModifyHeaderInfo => ({
    header, value, operation: "set"
})

export const InitializeSpoofing = async () => {
    log.initlialize("Creating new rules to spoof origin")

    const rules: ModifyHeaderDNR[] = [
        {
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    MaskHeader("Origin", "https://rewards.bing.com/")
                ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?rewards\\.bing\\.com/",
                resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"]
            }
        },

        {
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    MaskHeader("Origin", "https://bing.com/")
                ]
            },
            condition: {
                regexFilter: "^https://(www\\.)?bing\\.com/",
                resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"]
            }
        }
    ]

    const filtered_rules: chrome.declarativeNetRequest.Rule[] = rules.map((rule, index) => ({
        ...rule,
        id: index + 1,   // DNR rule IDs must be positive integers
        priority: 1
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: filtered_rules
    })

    const res = await fetch("https://rewards.bing.com/dashboard")
    const text = await res.text()
    const deployment_id = text.split("?dpl=")[1].split("\"")[0]
    await Storage.set(StorageKeys.DeploymentId, deployment_id)
}