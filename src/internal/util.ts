export const randomHex = (len: number = 32) => [...Array(len)].map(() => math.floor(math.random() * 16).toString(16)).join('')
export const sleep = (m: number) => new Promise(r => setTimeout(r, m))