# How does this work
The extension create a chain of tasks. Each running after 3-7 mins.

# The chain of task

Main = Service Worker registration
Check Date = Date validation
Automation = self-explainatory
Initialization = self-explainatory

<hr><br>

Main => Add events (onInstall, onStartup) => \*\*Initialization\*\* => end

Automation => execute Task.Search(), Task.Activity(), Task.ClaimPoints() synchronously => log all output from the automations => end

Check Date => Get standard MM/DD/YYYY => if (today !== last_saved_date) then reset all related to completion => end

Initialization => \*\*Refresh session** => \*\*Check Date\*\* => \*\*Automation\*\* => end

<hr><br>

# The functions

Task.Search():
1. if ignore_pc_search or completed_today_search then ( end )
2. Get randomized search queries list
3. Execute fake search and report search to the API for points:
```js
-> (looped 30 times. (loop iteration = 30) * (points/search = 3) = 90)
-> fetch(`https://bing.com/search?q=${query}`), reportSearch( query )
```