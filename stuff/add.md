HERE IS THE LIST WHAT TO ADD NEXT:

# Persistence quest automation

The quests that are being like 4 weeks long, Dunno bout it. It probably requires same-origin.
Here's the copied request in order to finish one of the task

```js
fetch("https://rewards.bing.com/earn/quest/ENstar_pcparent_FY26_WSB_Dec_punchcard?_rsc=dTFa1xaL_tAmt0NV", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9,",
    "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22earn%22%2C%7B%22children%22%3A%5B%22quest%22%2C%7B%22children%22%3A%5B%5B%22questId%22%2C%22ENstar_pcparent_FY26_WSB_Dec_punchcard%22%2C%22d%22%2Cnull%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2C%22refetch%22%2C16%5D",
    "priority": "u=1, i", "rsc": "1",
    "x-deployment-id": "20260707-1"
  },
  "referrer": "https://rewards.bing.com/earn/quest/ENstar_pcparent_FY26_WSB_Dec_punchcard",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
```

It's super fast to do manually but also risk getting banned

<hr>

# Claiming extra points
There are some points missing because Microsoft decided that you should put more effort to claim the extra unclaimed points.

Here are 2 codes that triggers the claim points thing.
Note: the microsoft rewards breaks sometime and just throw a 500 internal server error

```js
fetch("https://rewards.bing.com/dashboard", {
  "headers": {
    "accept": "text/x-component",
    "content-type": "text/plain;charset=UTF-8",
    "next-action": "00cf5ba7699f0e920ffcff223f9e48fea78fd49784",
    "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C16%5D",
    "x-deployment-id": "20260721-3"
  },
  "referrer": "https://rewards.bing.com/dashboard",
  "body": "[]",
  "method": "POST",
  "mode": "cors",
  "credentials": "omit"
});

fetch("https://rewards.bing.com/dashboard?_rsc=m4hDHKgQwxYB2kdn", {
  "headers": {
    "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22(nav)%22%2C%7B%22children%22%3A%5B%22dashboard%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2Cnull%2C0%5D%7D%2Cnull%2C%22refetch%22%2C16%5D",
    "rsc": "1",
    "x-deployment-id": "20260721-3"
  },
  "referrer": "https://rewards.bing.com/dashboard",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
```

Working on the solution, snippet to get the required param

```js
function convertNode(segment, value, isRoot = false) {
    let parallelRoutes = {};

    if (value && value.children) {
        const child = value.children;

        parallelRoutes = {
            children: convertNode(
                child[0],
                child[1],
                false
            )
        };
    }

    return [
        segment,
        parallelRoutes,
        null,
        null,
        isRoot ? 16 : 0
    ];
}


function parseFlightTree(tree) {
    const segment = tree[0];
    const routes = tree[1];

    return convertNode(segment, routes, true);
}


const routerStateTree = parseFlightTree(rawTree);

const nextRouterStateTree = encodeURIComponent(
    JSON.stringify(routerStateTree)
);
```