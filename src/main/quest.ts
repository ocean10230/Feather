import { TaskResponse } from "@/task"

export default async (): Promise<TaskResponse> => {
    return TaskResponse.Done
}