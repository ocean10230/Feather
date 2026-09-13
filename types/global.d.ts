declare global {
  var api: typeof chrome
  var runtime: typeof chrome.runtime
  var alarm: typeof chrome.alarms
  var tabs: typeof chrome.tabs
  var declare: typeof chrome.declarativeNetRequest
  var curl: typeof fetch
  var params: typeof URLSearchParams
  var json: typeof JSON
}

export {}