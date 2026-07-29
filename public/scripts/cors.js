chrome.runtime.onMessage.addListener(async (msg) => {
  if (window.location.host === "bing.com") {
    if (msg.type === "SPOOF_MOBILE_SEARCH") {

    }
  }

  if (window.location.host !== "rewards.bing.com") return

  if (msg.type === "COMPLETE_QUEST") // this wont be static for long. next-action or next-router-state-tree may changes. i need to act fast
    fetch("https://rewards.bing.com/earn", {
      headers: {
        accept: "text/x-component",
        "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": "70babbc81d2724f60d29a95c03b3d739cba77cea92",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22earn%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
        priority: "u=1, i"
      },
      referrer: "https://rewards.bing.com/earn",
      body: msg.data,
      method: "POST",
      credentials: "include"
    })
  else if (msg.type === "CHANGE_TITLE")
    document.title = msg.value;
})