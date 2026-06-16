// Validation middleware for task routes

const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

export const validateCreateTask = (req, res, next) => {
    const { title, description, status, priority, due_date } = req.body;
    const errors = [];

    // Title is required
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required');
    } else if (title.trim().length > 255) {
        errors.push('Title must be at most 255 characters');
    }

    // Description is optional but must be string if provided
    if (description !== undefined && description !== null && typeof description !== 'string') {
        errors.push('Description must be a string');
    }

    // Status validation (optional, defaults to 'todo')
    if (status !== undefined && status !== null) {
        if (!VALID_STATUSES.includes(status)) {
            errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
    }

    // Priority validation (optional, defaults to 'medium')
    if (priority !== undefined && priority !== null) {
        if (!VALID_PRIORITIES.includes(priority)) {
            errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
        }
    }

    // Due date validation (optional, must be a valid date if provided)
    if (due_date !== undefined && due_date !== null && due_date !== '') {
        const date = new Date(due_date);
        if (isNaN(date.getTime())) {
            errors.push('Due date must be a valid date (YYYY-MM-DD)');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize
    req.body.title = title.trim();
    if (description) req.body.description = description.trim();

    next();
};

export const validateUpdateTask = (req, res, next) => {
    const { title, description, status, priority, due_date } = req.body;
    const errors = [];

    // At least one field must be provided
    if (!title && !description && !status && !priority && !due_date) {
        errors.push('At least one field must be provided to update');
    }

    // Title validation (optional on update)
    if (title !== undefined && title !== null) {
        if (typeof title !== 'string' || title.trim().length === 0) {
            errors.push('Title cannot be empty');
        } else if (title.trim().length > 255) {
            errors.push('Title must be at most 255 characters');
        }
    }

    // Description validation
    if (description !== undefined && description !== null && typeof description !== 'string') {
        errors.push('Description must be a string');
    }

    // Status validation
    if (status !== undefined && status !== null) {
        if (!VALID_STATUSES.includes(status)) {
            errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
    }

    // Priority validation
    if (priority !== undefined && priority !== null) {
        if (!VALID_PRIORITIES.includes(priority)) {
            errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
        }
    }

    // Due date validation
    if (due_date !== undefined && due_date !== null && due_date !== '') {
        const date = new Date(due_date);
        if (isNaN(date.getTime())) {
            errors.push('Due date must be a valid date (YYYY-MM-DD)');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize
    if (title) req.body.title = title.trim();
    if (description) req.body.description = description.trim();

    next();
};
