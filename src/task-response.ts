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

export const TaskRegistrationStatus = {
  Unknown: 0,
  Success: 1,
  Failed: 2,
  Taken: 3,
  AlreadyDone: 4,
} as const;

export type TaskRegistrationStatus = typeof TaskRegistrationStatus[keyof typeof TaskRegistrationStatus];
export type TaskResponse = (typeof TaskResponse)[keyof typeof TaskResponse]