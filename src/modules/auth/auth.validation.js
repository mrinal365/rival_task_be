// Validation middleware for auth routes

export const validateSignup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    // Name validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required');
    } else if (name.trim().length < 2 || name.trim().length > 100) {
        errors.push('Name must be between 2 and 100 characters');
    }

    // Email validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Please provide a valid email address');
        }
    }

    // Password validation
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize inputs
    req.body.name = name.trim();
    req.body.email = email.trim().toLowerCase();

    next();
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Please provide a valid email address');
        }
    }

    // Password validation
    if (!password || typeof password !== 'string' || password.length === 0) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 400,
            message: 'Validation failed',
            errors
        });
    }

    // Sanitize
    req.body.email = email.trim().toLowerCase();

    next();
};
