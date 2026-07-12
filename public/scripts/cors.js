chrome.runtime.onMessage.addListener((msg) => {
  if (window.location.host === "bing.com") {
    if (msg.type === "SPOOF_MOBILE_SEARCH") {
      await chrome.storage.local.get("P")[key];
    }
  }

  if (window.location.host !== "rewards.bing.com") return

  if (msg.type === "COMPLETE_QUEST")
    fetch("https://rewards.bing.com/earn", {
      headers: {
        accept: "text/x-component",
        "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": "70babbc81d2724f60d29a95c03b3d739cba77cea92",
        "next-router-state-tree":
          "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22earn%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
        priority: "u=1, i"
      },
      referrer: "https://rewards.bing.com/earn",
      body: msg.data,
      method: "POST",
      credentials: "include"
    })
  else if (msg.type === "CLAIM_POINTS") {
    const date = new Date()
    const firstScript = document.querySelector("script[src][async]");
    const deployment_id = (new URL("https://idk" + firstScript.getAttribute("src"))).searchParams.get("dpl");

    fetch("https://rewards.bing.com/dashboard", {
      "headers": {
        "accept": "text/x-component",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": "00cf5ba7699f0e920ffcff223f9e48fea78fd49784",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C16%5D",
        "priority": "u=1, i", "x-deployment-id": deployment_id
      },
      "referrer": "https://rewards.bing.com/dashboard",
      "body": "[]", "method": "POST",
      "mode": "cors", "credentials": "include"
    });
    fetch("https://rewards.bing.com/dashboard?_rsc=m4hDHKgQwxYB2kdn", {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2C%22refetch%22%2C16%5D",
        "priority": "u=1, i", "rsc": "1",
        "x-deployment-id": "20260707-1"
      },
      "referrer": "https://rewards.bing.com/dashboard",
      "body": null, "method": "GET",
      "mode": "cors", "credentials": "include"
    });
  }
  else if (msg.type === "CHANGE_TITLE")
    document.title = msg.value;
})

window.onload = function() {
  if (window.location.host === "bing.com") {
    e.userAgent && (Object.defineProperty(navigator, "userAgent", {
      value: e.userAgent,
      writable: !1,
      configurable: !0
    }), Object.defineProperty(navigator, "platform", {
      value: e.platform,
      writable: !1,
      configurable: !0
    }))
  }
  if (window.location.host !== "rewards.bing.com") return;

  const container = document.querySelector(".flex.items-center.gap-2.rounded-ctrlBadgeCorner");
  const interval = setInterval(() => {
    if (!container.children) return
    if (container.children.length < 1) return
    if (container.children[1].textContent == "Automation User") {}

    else {
      const firstItem = container.children[0];
      const clone = firstItem.cloneNode(true);

      clone.textContent = "Automation User";
      clone.addEventListener("click", () => alert("This is a watermark. It's kinda useless but to indicate that you uses an automator rather than for decoration"))
      container.insertBefore(clone, container.children[1]);
    }
  }, 1000)
}