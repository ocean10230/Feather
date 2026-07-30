export const TaskResponse = {
  Done: 0,
  Confirm: 1,
  UnknownError: 2,
  GenerationFailure: 3,
  ParseFailure: 4,
  Disabled: 5,
  InvalidInformation: 6,
  BrowserError: 7,
  Ignored: 8,
} as const

export type TaskResponse = (typeof TaskResponse)[keyof typeof TaskResponse]
