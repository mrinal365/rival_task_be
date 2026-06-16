import { handleResponse } from "../../utils/index.js";
import {
    createTaskService,
    deleteTaskByIdService,
    getAllTasksService,
    getTaskByIdService,
    updateTaskByIdService
} from "./task.service.js";
import { getTaskHistoryService } from "./task.history.service.js";

// POST /api/tasks
export const createTask = async (req, res, next) => {
    try {
        const newTask = await createTaskService(req.user.id, req.body);
        handleResponse(res, 201, "Task created successfully", newTask);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// GET /api/tasks
export const getAllTasks = async (req, res, next) => {
    try {
        // console.log(req.user)        
        const result = await getAllTasksService(req.user.id, req.query, req.user.role);
        handleResponse(res, 200, "Tasks fetched successfully", result);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res, next) => {
    try {
        const task = await getTaskByIdService(req.user.id, req.params.id);
        handleResponse(res, 200, "Task fetched successfully", task);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// PATCH /api/tasks/:id
export const updateTaskById = async (req, res, next) => {
    try {
        const updatedTask = await updateTaskByIdService(req.user.id, req.params.id, req.body);
        handleResponse(res, 200, "Task updated successfully", updatedTask);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// DELETE /api/tasks/:id
export const deleteTaskById = async (req, res, next) => {
    try {
        await deleteTaskByIdService(req.user.id, req.params.id);
        handleResponse(res, 200, "Task deleted successfully");
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// GET /api/tasks/:id/history
export const getTaskHistory = async (req, res, next) => {
    try {
        const history = await getTaskHistoryService(req.user.id, req.user.role, req.params.id);
        handleResponse(res, 200, "Task history fetched successfully", history);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};
