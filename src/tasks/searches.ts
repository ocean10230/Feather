import { has_tag, log, sleep } from "@/expand"
import { InitializeSearchList, Storage, StorageKeys } from "@/rewards/utility"
import { reportSearch } from "@/rewards/component"

const GetRandomNumberList = (count: number) => {
    const arr = new Uint32Array(count);

    for (let i = 0; i < count; i++) {
        arr[i] = i;
    }

    for (let i = count - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}


export default async (): Promise<TaskResponse> => {
    if (has_tag("ignore_pc_search")) {
        await Storage.set(StorageKeys.SearchCompletion, true)
        return TaskResponse.Confirm
    }

    const completed = await Storage.get(StorageKeys.SearchCompletion)
    if (completed == true) return TaskResponse.Confirm

    if (await Storage.get(StorageKeys.SearchListExpiry) as number > Date.now()) InitializeSearchList()

    try {
        const randomIndexes = GetRandomNumberList(
            await Storage.get(StorageKeys.SearchListLength) as number
        );

        const queries = await Promise.all(
            Array.from(randomIndexes, idx =>
                Storage.get(`${StorageKeys.SearchList}-${idx}`)
            )
        ) as string[];

        log.pc_search("Queries list length:", queries.length, "items")

        let searchesDone = 0
        const maxSearches = 30

        log.pc_search("Current search progress:", `${searchesDone}/${maxSearches}`)

        // self-explainatory
        for (const query of queries) {
        if (searchesDone >= maxSearches) break

        try { await Promise.all([ fetch(`https://bing.com/search?q=${query}`), reportSearch( query ) ]); }
        catch(e) { console.error("Failed to search:", e) }

        searchesDone++
        await sleep(7000 + Math.random() * 3500)
        }
    }
    catch (e) {
        log.pc_search("Unknown error:", e)
        return TaskResponse.UnknownError
    }


    log.pc_search("Done. Awaiting confirmation")
    return TaskResponse.Done
}