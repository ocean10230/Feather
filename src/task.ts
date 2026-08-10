import { log } from "./internal";

export const TaskResponse = {
  Done: 0,
  Confirm: 1,
  UnknownError: 2,
  GenerationFailure: 3,
  ParseFailure: 4,
  Disabled: 5,
  InvalidInformation: 6,
  BrowserError: 7,
  PartialFailure: 9
} as const

const MappedResponse = ["Done", "Confirm", "UnknownError", "GenFailure", "ParseFailure", "Disabled", "InvalidInfo", "BrowserError", "PartialFailure"]

export const TaskRegistrationStatus = {
  Unknown: 0,
  Success: 1,
  Failed: 2,
  Taken: 3,
  AlreadyDone: 4,
} as const

export type TaskRegistrationStatus = typeof TaskRegistrationStatus[keyof typeof TaskRegistrationStatus];
export type TaskResponse = (typeof TaskResponse)[keyof typeof TaskResponse]

const RegisteredTasks = new Map<string, TaskRegistration>()

export const Register = async (task: TaskRegistration) => {
    if (RegisteredTasks.has(task.name)) return TaskRegistrationStatus.Taken
    const handler = task.handler
    task.handler = async () => {
        try { handler() }
        catch(e) { log.error("Caught an error:",e) }
    }
    log.task("Registering task:", task.name)

    try {
        await chrome.alarms.create(task.name, { periodInMinutes: task.interval })
        RegisteredTasks.set(task.name, task)
    }
    catch (e) {
        log.task("Failed to register task \"" + task.name + "\". Error:", e)
        return TaskRegistrationStatus.Failed
    }

    return TaskRegistrationStatus.Success
}

export const Listen = () => {
    for (const Task of RegisteredTasks.values()) {
        log.task("Triggering handler of ", Task.name)
        try {
            void Task.handler()
        }
        catch (e) {
            log.task("Failed to trigger handler of task \"" + Task.name + "\". Error:", e)
            console.error("Critical error, immediate fix needed:" ,e, "\nFrom ", `"${Task.name}"`)
        }
    }

    chrome.alarms.onAlarm.addListener(async PendingTask => {
        try {
            const Task = RegisteredTasks.get(PendingTask.name)

            if (Task) {
                if (Task.done) {
                    RegisteredTasks.delete(Task.name)
                    await chrome.alarms.clear(Task.name)
                    return
                }

                const Result: TaskResponse = await Task.handler()
                log.task(`Task "${Task.name}" exitted with result id: ${MappedResponse[Result]}`)
            }
        }
        catch (e) {
            log.task("Failed to trigger handler of task \"" + PendingTask.name + "\". Error:", e)
            console.error("Critical error, immediate fix needed:" ,e, "\nFrom ", `"${PendingTask.name}"`)
        }
    })

    setInterval(() => {}, 15000)
}