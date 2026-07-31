import { useEffect } from "react"
import { Storage, StorageKeys, Alarms } from "../../rewards/src/rewards/utility"
import Icon from "../../rewards/public/icon.png"

const App = () => {
  useEffect(() => console.log(Storage, StorageKeys, Alarms, Icon), [])

  return <div>
  </div>
}

export default App