import { log } from "./expand";
import { Storage } from "./rewards/utility"
import { TaskResponse } from "./task-response"

declare enum TaskRegistrationStatus {
  Unknown, Success, Failed, Taken, AlreadyDone
}

declare enum TaskRemovalStatus {
  Unknown, Success, Failed, NotFound
}

const RegisteredTasks = new Map<string, TaskRegistration>()

export const Register = async (task: TaskRegistration) => {
    if (await Storage.get(`TASK-${task.name}-COMPLETION`) === true) return TaskRegistrationStatus.AlreadyDone
    if (RegisteredTasks.has(task.name)) return TaskRegistrationStatus.Taken

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

export const Remove = async (task: string): Promise<TaskRemovalStatus> => {
    if (!RegisteredTasks.has(task)) return TaskRemovalStatus.NotFound

    try {
        RegisteredTasks.delete(task)
        await chrome.alarms.clear(task)
    }
    catch (e) {
        log.task("Failed to delete task \"" + task + "\".\n Error:", e)
        return TaskRemovalStatus.Failed
    }

    return TaskRemovalStatus.Success
}

export const ClearTaskStatus = async () => {
    const UnclearedTaskStatus = Array.from(RegisteredTasks.keys())
    await Promise.all(UnclearedTaskStatus.map(task => Storage.set(`TASK-${task}-COMPLETION`, false)))
}


export const Listen = () => {
    for (const task of RegisteredTasks.values()) void task.handler()

    chrome.alarms.onAlarm.addListener(async PendingTask => {
        const Task = RegisteredTasks.get(PendingTask.name)

        if (Task) {
            if (Task.done) {
                RegisteredTasks.delete(Task.name)
                await chrome.alarms.clear(Task.name)
                
                return
            }

            const Result: TaskResponse | string = await Task.handler()

            switch (Result) {
                case TaskResponse.Confirm:
                    log.task(`Task "${Task.name}" is done. Attempt clearing out...`)
                    RegisteredTasks.delete(Task.name)
                    await chrome.alarms.clear(Task.name)
                    await Storage.set(`TASK-${Task.name}-COMPLETION`, true)
                    break
                case TaskResponse.Done:
                    log.task(`Task "${Task.name}" is done. Awaiting confirmation`)
                    break
                case TaskResponse.Disabled:
                    if (!Task.disable_logs)
                        log.task(`Task "${Task.name}" is disabled. Logs for this task will be temporarily be ignored until turned back on`)
                    else
                        RegisteredTasks.set(Task.name, { ...Task, disable_logs: true })

                    break
                case TaskResponse.Ignored:
                    if (!Task.disable_logs)
                        log.task(`Task "${Task.name}" is ignored until one of the developer tag get removed`)
                    else
                        RegisteredTasks.set(Task.name, { ...Task, disable_logs: true })
                    break
                case TaskResponse.ParseFailure:
                    log.task(`Task "${Task.name}" was unable to parse some data. Please check console for more`)
                    break
                case TaskResponse.GenerationFailure:
                    log.task(`Task "${Task.name}" was unable to generate a complete randomized value. Please check console for more`)
                    break
                case TaskResponse.InvalidInformation:
                    log.task(`Task "${Task.name}" was given invalid data. Please fix immediately`)
                    break
                case TaskResponse.BrowserError:
                    log.task(`Task "${Task.name}" has encountered browser's internal error. Please check console for more`)
                    break
                default:
                    log.task(`Task "${Task.name}" has gotten an unknown error/placeholder result. Please check source code for invalid value`)
                    break
            }
        }
    })
}