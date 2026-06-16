import pool from '../../config/db.js';
import { ROLES } from '../../config/roles.js';
import { createHistoryLog } from './task.history.service.js';
import { emitToAdmins } from '../../socket/socket.manager.js';
import { SOCKET_EVENTS } from '../../socket/socket.events.js';

// Create a new task for a user
export const createTaskService = async (userId, taskData) => {
    const { title, description, status, priority, due_date, attachments } = taskData;

    const result = await pool.query(
        `INSERT INTO tasks (user_id, title, description, status, priority, due_date, attachments) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
            userId,
            title,
            description || null,
            status || 'todo',
            priority || 'medium',
            due_date || null,
            attachments || []
        ]
    );

    const task = result.rows[0];

    // Log activity history
    await createHistoryLog(task.id, userId, 'created', {
        title: task.title,
        status: task.status,
        priority: task.priority
    });

    // Notify all connected admins in real-time
    emitToAdmins(SOCKET_EVENTS.TASK_CREATED, {
        task,
        performedByUserId: userId,
    });

    return task;
};

// Get all tasks for a user with filtering, pagination, search, and sort
// Admin sees all tasks; regular users see only their own
export const getAllTasksService = async (userId, queryParams, role) => {
    const {
        status,
        page = 1,
        limit = 10,
        search,
        sortBy = 'created_at',
        order = 'desc'
    } = queryParams;

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'due_date', 'priority', 'title', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Handle priority sorting — map to numeric value for correct ordering
    let orderClause;
    if (sortField === 'priority') {
        orderClause = `CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 WHEN 'low' THEN 1 END ${sortOrder}`;
    } else {
        orderClause = `${sortField} ${sortOrder}`;
    }

    // Build dynamic WHERE clause — admin skips user_id filter
    const isAdmin = role === ROLES.ADMIN;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (!isAdmin) {
        conditions.push(`user_id = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
    }

    if (status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(status);
        paramIndex++;
    }

    if (search) {
        conditions.push(`title ILIKE $${paramIndex}`);
        values.push(`%${search}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination metadata
    const countResult = await pool.query(
        `SELECT COUNT(*) FROM tasks ${whereClause}`,
        values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get tasks
    const result = await pool.query(
        `SELECT * FROM tasks 
         ${whereClause} 
         ORDER BY ${orderClause}
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, parseInt(limit), offset]
    );

    return {
        tasks: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit))
        }
    };
};

// Get a single task by ID
// Admin can view any task; regular user can only view their own
export const getTaskByIdService = async (userId, taskId, role) => {
    const isAdmin = role === ROLES.ADMIN;
    
    const query = isAdmin 
        ? 'SELECT * FROM tasks WHERE id = $1' 
        : 'SELECT * FROM tasks WHERE id = $1 AND user_id = $2';
    const params = isAdmin ? [taskId] : [taskId, userId];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Update a task (scoped by role) — partial update
export const updateTaskByIdService = async (userId, taskId, updateData, role) => {
    const isAdmin = role === ROLES.ADMIN;

    // First check if task exists and user has access to it
    const checkQuery = isAdmin
        ? 'SELECT * FROM tasks WHERE id = $1'
        : 'SELECT * FROM tasks WHERE id = $1 AND user_id = $2';
    const checkParams = isAdmin ? [taskId] : [taskId, userId];

    const existing = await pool.query(checkQuery, checkParams);

    if (existing.rows.length === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const existingTask = existing.rows[0];

    // Build dynamic SET clause for partial update
    const allowedFields = ['title', 'description', 'status', 'priority', 'due_date', 'attachments'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    const changes = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            const oldValue = existingTask[field];
            const newValue = updateData[field];

            // Compare values (handling dates/nulls/arrays)
            let isChanged = oldValue !== newValue;
            if (field === 'due_date' && (oldValue || newValue)) {
                const oldDateStr = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
                const newDateStr = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
                isChanged = oldDateStr !== newDateStr;
            } else if (field === 'attachments') {
                const oldArr = Array.isArray(oldValue) ? oldValue : [];
                const newArr = Array.isArray(newValue) ? newValue : [];
                isChanged = JSON.stringify([...oldArr].sort()) !== JSON.stringify([...newArr].sort());
            }

            if (isChanged) {
                setClauses.push(`${field} = $${paramIndex}`);
                values.push(newValue);
                paramIndex++;
                
                // Do not track attachments in changes for activity history
                if (field !== 'attachments') {
                    changes[field] = { old: oldValue, new: newValue };
                }
            }
        }
    }

    // If no changes, just return the existing task without updating database or logging history
    if (setClauses.length === 0) {
        return existingTask;
    }

    // Always update updated_at
    setClauses.push(`updated_at = NOW()`);

    const updateQuery = isAdmin
        ? `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`
        : `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
    const updateParams = isAdmin
        ? [...values, taskId]
        : [...values, taskId, userId];

    const result = await pool.query(updateQuery, updateParams);
    const updatedTask = result.rows[0];

    // Log activity history
    await createHistoryLog(taskId, userId, 'updated', changes);

    // Notify all connected admins in real-time
    emitToAdmins(SOCKET_EVENTS.TASK_UPDATED, {
        task: updatedTask,
        changes,
        performedByUserId: userId,
    });

    return updatedTask;
};

// Delete a task (scoped by role)
export const deleteTaskByIdService = async (userId, taskId, role) => {
    const isAdmin = role === ROLES.ADMIN;

    const query = isAdmin
        ? 'DELETE FROM tasks WHERE id = $1 RETURNING *'
        : 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
    const params = isAdmin ? [taskId] : [taskId, userId];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const deletedTask = result.rows[0];

    // Log activity history
    await createHistoryLog(taskId, userId, 'deleted', {
        title: deletedTask.title
    });

    return deletedTask;
};
