const gamesWithMaps_base = ["minecraft","mc","mcbe","mc java","minecraft java","minecraft bedrock","elden ring","skyrim","gta v enhanced online","gta online","fivem","gta v online","sea of thieves","among us","ark: survival evolved","rust","valheim","terraria","no man's sky","subnautica","the forest","dayz","7 days to die","apex legends","fortnite","battlefield 2042","dota 2","league of legends","smite","world of warcraft","final fantasy xiv","guild wars 2","black desert online","runescape","path of exile","diablo iv","monster hunter world","far cry 6","just cause 4","watch dogs 2","cyberpunk 2077","geometry dash","gta san andreas","gta vice city","gta iv","gta iii","forza horizon 5","ets2","red dead redemption 2"]

export const socialMedias = [
    "facebook","instagram","twitter","tiktok","snapchat","linkedin","youtube","reddit","pinterest","tumblr","discord","twitch","clubhouse",
    "mastodon","bluesky","threads", "wechat","qq","qzone","line","kakaotalk","viber","telegram","signal","whatsapp","messenger",
    "weibo","douyin","vk","odnoklassniki","mixi", "baidu tieba","nextdoor","peach","ello","diaspora","minds","steemit","gab","parler","truth social","gettr",
    "mewe","yubo", "vimeo","flickr","deviantart", "soundcloud","bandcamp","audius","last.fm","mixcloud",
    "kik","amino","fanpop","couchsurfing","meetup","substack"
]

export const toBe = [
  "successful",
  "productive",
  "good at something",
  "cool","rich",
  "a billionare",
  "a millionare", "less sad",
  "a trillionare", "joyful",
  "rich guy", "a person with great childhood",
  "motivated", "a kid",
  "sigma", "a kid again",
  "touching grass",
  "touch grass", "happy"
]

export const games: string[] = [
    'resident evil','roblox','gta','gta v','gta iv','gta sa','gta vc','gta vc stories','gta iii',
    'forza','forza 5','forza horizon 4','ets2','csgo','counter-strike 2','cod',
    'red dead online','rdr2','gamepass','xbox','minecraft','robux','roblox pets',
    'world of warcraft','final fantasy','guild wars','lol','dota 2','the sims 4',
    'animal crossing','stardew valley','cyberpunk 2077','elden ring','witcher 3',
    'super smash bros','brawlhalla','fortnite','apex legends','valorant',
    'battlefield 2042','palworld','black desert online','runescape','warframe',
    'smite','overwatch 2','mobile legends','deadlock','arena of valor',
    'marvel rivals','terraria','helldivers 2',"baldur's gate 3",
    'kingdom come deliverance 2','skyrim','horizon forbidden west','diablo 4',
    'geometry dash','hollow knight','silksong','internet cafe simulator',
    'subnautica','subnautica below zero','ark survival evolved','the forest',
    'the long dark',"no man's sky",'sea of thieves','valheim','rust',
    '7 days to die','dayz','fall guys','among us',
    'assassin\'s creed shadows','mafia definitive edition','saints row'
]

export const gamesWithMaps = [
    ...gamesWithMaps_base,
    ...gamesWithMaps_base.filter(e => e.includes(" ")).map(e => e.replaceAll(" ", "")),
]

const samsung_s_phone = [
    "Galaxy S21", "Galaxy S22",
    "Galaxy S23", "Galaxy S24",
]

const iphone = [
    "iPhone 13", "iPhone 14",
    "iPhone 15", "iPhone 16"
]

export const phones = [
  "iPhone SE (3rd gen)", ...iphone,
  ...iphone.map(phone => phone + " Pro"),
  ...iphone.map(phone => phone + " Pro Max"),
  
  ...samsung_s_phone,
  ...samsung_s_phone.map(phone => phone + " Ultra"),
  ...samsung_s_phone.map(phone => phone + " FE"),
  
  "Pixel 6", "Pixel 7",
  "Pixel 8", "Pixel 9",
  
  "OnePlus 9", "OnePlus 10 Pro",
  "OnePlus 11", "OnePlus 12",
]

export const components_base = [
  "rtx 3060", "rtx 4060", "rtx 4060 ti", "rtx 3050", "gtx 1650", "gtx 1060",
  "rx 6600", "rx 6700 xt", "rx 7600", "rx 580", "arc a750",
  "ryzen 5 3600", "ryzen 5 5600", "ryzen 5 5600x", "ryzen 7 5700x3d", "ryzen 7 7800x3d",
  "i5 12400f", "i5 13400f", "i3 12100f", "i5 10400f",
  "ddr4 ram 16gb", "ddr5 ram 32gb", "1tb nvme ssd", "2tb nvme ssd",
  "budget B550 motherboard", "b650 motherboard", "650w psu gold",
  "budget cpu cooler", "thermalright peerless assassin 120", "budget pc case",
  "corsair rams", "kingston rams"
]

export const hardwareBases: ((h: string) => string)[] = [
  h => h,
  h => `${h} price`,
  h => `${h} review`,
  h => `${h} benchmark`,
  h => `${h} bottleneck`,
  h => `${h} overclocking guide`,
  h => `best settings for ${h}`,
  h => `is ${h} still good`,
  h => `is ${h} worth buying`,
  h => `how to install ${h}`,
  h => `best budget build with ${h}`,
  h => `temperature normal for ${h}`,
  h => `driver download ${h}`
]

export const pcBuilding_base = [
  "budget pc build", "1080p gaming pc", "1440p gaming pc",
  "how to build a pc", "how to choose psu", "how much ram for gaming",
  "single channel vs dual channel ram", "how to update bios", "how to enable xmp",
  "how to undervolt cpu", "how to undervolt gpu", "how to lower cpu temperature",
  "how to increase fps", "best nvidia control panel settings", "how to enable resizable bar"
]