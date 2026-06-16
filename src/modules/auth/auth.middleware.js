import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

// JWT authentication middleware
// Extracts Bearer token, verifies it, and attaches user to req
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 401,
            message: 'Access denied. No token provided.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch fresh user details (particularly role) from DB
        const result = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 401,
                message: 'User no longer exists.'
            });
        }
        
        req.user = result.rows[0];
        next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            message: 'Invalid or expired token'
        });
    }
};
