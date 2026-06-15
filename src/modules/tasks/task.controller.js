import { handleResponse } from "../../utils/index.js";
import { createTaskService, deleteTaskByIdService, getAllTasksService, getTaskByIdService, updateTaskByIdService } from "./task.service.js";

export const createTask = async (req, res, next) => {
    const { } = req.body
    try {
        const newTask = await createTaskService();
        handleResponse(res, 201, "Task Created Successfully", newTask)
    } catch (err) {
        next(err); // this will send to the centralised error handler 
    }
}

export const getAllTasks = async (req, res, next) => {
    try {
        const tasks = await getAllTasksService();
        handleResponse(res, 200, "Tasks fetched successfully", tasks)
    } catch (err) {
        next(err);
    }
}

export const getTaskById = async (req, res, next) => {
    try {
        const task = await getTaskByIdService(req.params.id);
        handleResponse(res, 200, "Task fetched successfully", task)
    } catch (err) {
        next(err);
    }
}

export const updateTaskById = async (req, res, next) => {
    try {
        const newTask = await updateTaskByIdService(req.params.id, req.body);
        handleResponse(res, 200, "Task Updated Successfully", {})
    } catch (err) {
        next(err);
    }
}

export const deleteTaskById = async (req, res, next) => {
    try {
        const newTask = await deleteTaskByIdService(req.params.id);
        handleResponse(res, 201, "Task Deleted Successfully")
    } catch (err) {
        next(err);
    }
}
