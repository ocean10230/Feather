declare type TaskRegistration = {
  handler: () => Promise<TaskResponse | string>,
  name: string,
  interval: number,
  done?: boolean,
  disable_logs?: boolean
}

enum TaskRegistrationStatus { Unknown, Success, Failed, Taken, AlreadyDone }
enum TaskRemovalStatus { Unknown, Success, Failed, NotFound }
// 1. Augment the global scope
declare global {
  var c = chrome
}