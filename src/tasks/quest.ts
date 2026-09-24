import { TaskResponse } from "@/internal/task"

export default async (): Promise<TaskResponse> => {
    return TaskResponse.Confirm
}