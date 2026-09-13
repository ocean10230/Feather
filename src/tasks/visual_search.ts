import { Storage, StorageKeys } from "shared/storage"
import { TaskResponse } from "@/internal/task"
import { Bing, ParseReport, ParseSearchComponent } from "@/rewards/parser"
import { log } from "shared/log"

const resolution = [ 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600 ]
const r = () => resolution[math.floor(math.random() * resolution.length)]

const report_visual_search = async (query: string, bcid: string, form: string, fetch_prom: Response) => {
    log.searches(`Reporting visual search`)

    const {IG, IID} = ParseSearchComponent(await fetch_prom.text())

    const url = Bing + "/rewardsapp/reportActivity"
    const body = new params({ url: Bing + `/search?q=${encodeURIComponent(query)}&FORM=${form}`, V: "web" })

    return await curl(`${url}?${ new params({ IG, IID, q: query, FORM: form, bcid }) }`, {
        method: "POST", body, credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*" }
    })
}

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.VisualSearchCompletion)
    if (completed === true) return TaskResponse.Confirm
    
    const [w,h] = [r(),r()]
    const [ws,hs] = [String(w),String(h)]

    const random_image = await curl(`https://picsum.photos/${w}/${h}`)
    const blob = await random_image.blob()

    const imageBin = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
            if (typeof reader.result !== "string") return reject(new Error("Failed to convert image to Base64"))
            resolve(reader.result.split(",")[1])
        }

        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })

    const fetch_params = new params({
        iss: "sbiupload", FORM: "SBIWEB", sbisrc: "ImgPicker",
        ptime: "101",
        sbifsz: `${w}+x+${h}+·+${math.round(blob.size/1024*100)/100}+kB+·+${blob.type.split("/")[1]}`,
        sbifnm: "untitled.jpg",
        thw: ws, thh: hs, dlen: String(blob.size),
        expw: ws, exph: hs,
    })

    const body = new FormData()
    body.append("cbir", "sbi")
    body.append("imageBin", imageBin)

    const response = await curl(
        `${Bing}/images/kblob?${fetch_params.toString()}`,
        { method: "POST", body, credentials: "include" }
    )

    const data = await response.json()
    const redirectUrl = data.redirectUrl
    const url = new URL(redirectUrl, Bing)
    
    if (!redirectUrl) return TaskResponse.ParseFailure

    const paramz = Object.fromEntries(url.searchParams)
    const fetchUrl = Bing + redirectUrl
    const parsed_state = ParseReport(await (await report_visual_search(paramz.q, paramz.bcid, fetch_params.get("FORM") || "SBIWEB", await curl(fetchUrl))).text())

    if (parsed_state.RewardsSessionData.GiveBalance > 0) return TaskResponse.Confirm
    return TaskResponse.Done
}