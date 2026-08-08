import { Storage, StorageKeys } from "@/rewards/utility"
import { TaskResponse } from "@/task"
import { log, randomHex } from "@/expand"
import { Bing, ParseReport, ParseSearchComponent } from "@/rewards/component"

const resolution = [ 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600 ]

const report_visual_search = async (query: string, bcid: string, form: string, fetch_prom: Response) => {
    log.searches(`Reporting visual search (bcid: ${bcid}) to endpoint`)
    
    const text = await fetch_prom.text()
    const components = ParseSearchComponent(text)
    const IG =  components.IG
    const IID = components.IID

    const rdrig = randomHex(32)

    const url = Bing + "/rewardsapp/reportActivity"
    const params = new URLSearchParams({ IG, IID, q: query, FORM: form, rdr: "1", rdrig, ajaxreq: "1", bcid })
    const body = new URLSearchParams({ url: Bing + `/search?q=${encodeURIComponent(query)}&FORM=${form}&rdr=1&rdrig=${rdrig}`, V: "web" })

    return await fetch(`${url}?${params}`, {
        method: "POST", body, credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*" }
    })
}

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.VisualSearchCompletion)
    if (completed === true) return TaskResponse.Confirm

    const width = resolution[Math.floor(Math.random() * resolution.length)]
    const height = resolution[Math.floor(Math.random() * resolution.length)]

    const random_image = await fetch(`https://picsum.photos/${width}/${height}`)
    const blob = await random_image.blob()

    const imageBin = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onloadend = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Failed to convert image to Base64"))
                return
            }

            resolve(reader.result.split(",")[1])
        }

        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })

    const fetch_params = new URLSearchParams({
        iss: "sbiupload", FORM: "SBIWEB", sbisrc: "ImgPicker",
        sbifsz: `${width}+x+${height}+·+${Math.round(blob.size / 1024 * 100) / 100}+kB+·+${blob.type.split("/")[1]}`,
        sbifnm: "untitled.jpg",
        thw: String(width),
        thh: String(height),
        ptime: "101",
        dlen: String(blob.size),
        expw: String(width),
        exph: String(height),
    })

    const form = new FormData()
    form.append("cbir", "sbi")
    form.append("imageBin", imageBin)

    const response = await fetch(
        `${Bing}/images/kblob?${fetch_params.toString()}`,
        { method: "POST", body: form, credentials: "include" }
    )

    const data = await response.json()

    const redirectUrl = data.redirectUrl
    const url = new URL(redirectUrl, Bing)
    
    if (!redirectUrl) return TaskResponse.ParseFailure

    const params = Object.fromEntries(url.searchParams)
    const fetchUrl = Bing + redirectUrl
    
    const report = await report_visual_search(params.q, params.bcid, fetch_params.get("FORM") || "SBIWEB", await fetch(fetchUrl))
    const parsed_state = ParseReport(await report.text())

    if (parsed_state.RewardsSessionData.GiveBalance > 0) return TaskResponse.Confirm

    return TaskResponse.Done
}