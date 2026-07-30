declare type TaskRegistration = {
  handler: () => Promise<TaskResponse | string>,
  name: string,
  interval: number,
  done?: boolean,
  ignorance_tags?: string[],
  disabled?: boolean,
  disable_logs?: boolean
}

enum TaskRegistrationStatus {
  Unknown, Success, Failed, Taken, AlreadyDone
}

enum TaskRemovalStatus {
  Unknown, Success, Failed, NotFound
}