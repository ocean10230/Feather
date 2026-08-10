declare global {
  var api: typeof chrome
  var runtime: typeof chrome.runtime
  var tabs: typeof chrome.tabs
  var console_init: boolean
  var console_color: Record<string, string>
}

export {};