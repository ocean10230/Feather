import { pcall } from "@/rewards/utility";
import { log } from "shared/log"

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

export const TaskRegistrationStatus = {
  Unknown: 0,
  Success: 1,
  Failed: 2,
  Taken: 3,
  AlreadyDone: 4,
} as const


const MappedResponse = Object.keys(TaskResponse)

export type TaskRegistrationStatus = typeof TaskRegistrationStatus[keyof typeof TaskRegistrationStatus];
export type TaskResponse = (typeof TaskResponse)[keyof typeof TaskResponse]

const RegisteredTasks = new Map<string, TaskRegistration>()

export const Register = async (task: TaskRegistration) => {
    if (RegisteredTasks.has(task.name)) return TaskRegistrationStatus.Taken
    const handler = task.handler

    task.handler = async () => pcall(handler)
    log.task("Adding", task.name)

    await alarm.create(task.name, { periodInMinutes: task.interval })
    RegisteredTasks.set(task.name, task)

    return TaskRegistrationStatus.Success
}

const Error = (Task: TaskRegistration, e: any) => {
    log.task(`ERR: "${Task.name}"`)
    log.error(`Fix needed for "${Task.name}": `, e)
}

export const Listen = () => {
    for (const Task of RegisteredTasks.values()) {
        log.task("Runnning", Task.name)
        try { void Task.handler() }
        catch (e) { Error(Task, e) }
    }

    alarm.onAlarm.addListener(async PendingTask => {
        const Task = RegisteredTasks.get(PendingTask.name)
        if (!Task) return

        try {
           if (Task.done) {
                RegisteredTasks.delete(Task.name)
                await alarm.clear(Task.name)
                return
            }

            const Result: TaskResponse = await Task.handler()
            log.task(`Task "${Task.name}": ${MappedResponse[Result]}`)
        }
        catch (e) { Error(Task, e) }
    })

    setInterval(() => {}, 15000)
}