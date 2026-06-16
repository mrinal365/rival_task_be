import pool from '../../config/db.js';
import { ROLES } from '../../config/roles.js';

/**
 * Log activity for a task.
 * Can be run within a transaction client if provided, or using the default pool.
 */
export const createHistoryLog = async (taskId, userId, action, changes = {}, client = pool) => {
    try {
        await client.query(
            `INSERT INTO task_history (task_id, user_id, action, changes)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [taskId, userId, action, JSON.stringify(changes)]
        );
    } catch (err) {
        console.error('Failed to log task history:', err.message);
        // We do not throw to prevent history logging failures from failing the primary action,
        // or we could throw depending on requirements. Let's log and not block the transaction.
    }
};

/**
 * Fetch history logs for a task.
 * Scoped by role: user can only see history of tasks they own, admin can see history of any task.
 */
export const getTaskHistoryService = async (userId, userRole, taskId) => {
    // First verify task exists and user has access to it
    const taskCheck = await pool.query(
        'SELECT user_id FROM tasks WHERE id = $1',
        [taskId]
    );

    if (taskCheck.rows.length === 0) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
    }

    const taskOwnerId = taskCheck.rows[0].user_id;
    if (userRole !== ROLES.ADMIN && taskOwnerId !== userId) {
        const error = new Error('Unauthorized to view this task history');
        error.statusCode = 403;
        throw error;
    }

    // Retrieve history ordered by newest first, joining with users to get performer details
    const result = await pool.query(
        `SELECT th.id, th.task_id, th.action, th.changes, th.created_at,
                u.id as user_id, u.name as user_name, u.email as user_email
         FROM task_history th
         LEFT JOIN users u ON th.user_id = u.id
         WHERE th.task_id = $1
         ORDER BY th.created_at DESC`,
        [taskId]
    );

    return result.rows.map(row => ({
        id: row.id,
        taskId: row.task_id,
        action: row.action,
        changes: row.changes,
        createdAt: row.created_at,
        user: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email
        }
    }));
};
