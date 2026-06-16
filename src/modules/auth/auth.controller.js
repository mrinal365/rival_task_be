import { handleResponse } from '../../utils/index.js';
import { signupService, loginService, getMeService } from './auth.service.js';

// POST /api/auth/signup
export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const result = await signupService(name, email, password);
        handleResponse(res, 201, 'User registered successfully', result);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await loginService(email, password);
        handleResponse(res, 200, 'Login successful', result);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
    try {
        const user = await getMeService(req.user.id);
        handleResponse(res, 200, 'User profile fetched successfully', user);
    } catch (err) {
        if (err.statusCode) {
            return handleResponse(res, err.statusCode, err.message);
        }
        next(err);
    }
};
