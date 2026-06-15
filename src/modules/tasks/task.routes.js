import Router from 'express'
import { createTask, deleteTaskById, getAllTasks, getTaskById, updateTaskById } from './task.controller.js';

const router = Router();

router.post('/', createTask)
router.get("/", getAllTasks)
router.get("/:id", getTaskById)
router.put("/:id", updateTaskById)
router.delete("/:id", deleteTaskById)

export default router