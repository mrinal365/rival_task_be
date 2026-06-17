import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DEFAULT_ROLE } from '../../config/roles.js';

const SALT_ROUNDS = 10;

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Signup — create a new user
export const signupService = async (name, email, password) => {
    // Check if user already exists
    const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    if (existingUser.rows.length > 0) {
        const error = new Error('A user with this email already exists');
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user with default role
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, DEFAULT_ROLE]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return { user, token };
};

// Login — authenticate user and return JWT
export const loginService = async (email, password) => {
    // Find user by email
    const result = await pool.query(
        'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Generate token — exclude password from user object
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    return { user: userWithoutPassword, token };
};

// Get current user profile
export const getMeService = async (userId) => {
    const result = await pool.query(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Make a user an admin
export const makeAdminService = async (userId) => {
    const result = await pool.query(
        `UPDATE users 
         SET role = 'admin', updated_at = NOW() 
         WHERE id = $1 
         RETURNING id, name, email, role, created_at, updated_at`,
        [userId]
    );

    if (result.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};
