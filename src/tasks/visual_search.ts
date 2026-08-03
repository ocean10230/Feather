import { Storage, StorageKeys } from "@/rewards/utility"
import { TaskResponse } from "@/task"

const resolution = [
    100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600
]

export default async (): Promise<TaskResponse> => {
    const completed = await Storage.get(StorageKeys.SearchCompletion)
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

    const params = new URLSearchParams({
        iss: "sbiupload",
        FORM: "SBIWEB",
        sbisrc: "ImgPicker",
        sbifsz: `${width}+x+${height}+·+${Math.round(blob.size / 1024 * 100) / 100}+kB+·+${blob.type.split("/")[1]}`,
        sbifnm: "random.png",
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
        `https://www.bing.com/images/kblob?${params.toString()}`,
        {
            method: "POST",
            body: form,
            credentials: "include",
        }
    )

    console.log(await response.text())

    return TaskResponse.Done
}