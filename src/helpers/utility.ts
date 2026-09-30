export const pcall = async <T>(func: () => Promise<T> | T): Promise<[T | any, boolean]> => {
  try {
    const result = await func()
    return [result, true]
  } catch (e) {
    return [e, false]
  }
}

export const date=(d=new Date): QuestDateFormat=>`${(d.getMonth()+1+'').padStart(2,'0')}/${(d.getDate()+'').padStart(2,'0')}/${d.getFullYear()}`

export const randomHex = (len: number = 32) => [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
export const sleep = (m: number) => new Promise(r => setTimeout(r, m))