declare type StorageData = string | number | Record<any, any> | Array<any> | boolean
declare type None = undefined | null | void | "$undefined"
declare type ModifyHeader = {
    action: chrome.declarativeNetRequest.RuleAction,
    condition: chrome.declarativeNetRequest.RuleCondition
}

declare enum ResourceType {
    MAIN_FRAME = "main_frame",
    SUB_FRAME = "sub_frame",
    STYLESHEET = "stylesheet",
    SCRIPT = "script",
    IMAGE = "image",
    FONT = "font",
    OBJECT = "object",
    XMLHTTPREQUEST = "xmlhttprequest",
    PING = "ping",
    CSP_REPORT = "csp_report",
    MEDIA = "media",
    WEBSOCKET = "websocket",
    WEBTRANSPORT = "webtransport",
    WEBBUNDLE = "webbundle",
    OTHER = "other",
}

declare type resourceTypes = `${ResourceType}`[] | undefined;