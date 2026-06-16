import { Router } from 'express';
import { createTask, deleteTaskById, getAllTasks, getTaskById, updateTaskById, getTaskHistory } from './task.controller.js';
import { validateCreateTask, validateUpdateTask } from './task.validation.js';
import { authenticate } from '../auth/auth.middleware.js';
import { authorize } from '../../middlewares/authorize.middleware.js';
import { ROLES } from '../../config/roles.js';

const router = Router();

// All task routes require authentication
// router.use(authenticate);

// Both user and admin can do CRUD on tasks
router.post('/',
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    validateCreateTask,
    createTask
);
router.get("/",
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    getAllTasks
);
router.get("/:id",
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    getTaskById
);
router.patch("/:id",
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    validateUpdateTask,
    updateTaskById
);
router.delete("/:id",
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    deleteTaskById
);
router.get("/:id/history",
    authenticate,
    authorize(ROLES.USER, ROLES.ADMIN),
    getTaskHistory
);

export default router;
