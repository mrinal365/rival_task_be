import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ROLES } from '../config/roles.js';

import pool from '../config/db.js';

/**
 * io — the Socket.io Server instance.
 * Only set after initSocket() is called.
 */
let io = null;

/**
 * adminSockets — tracks all connected admin socket IDs.
 * Map<userId, Set<socketId>>
 * Supports multi-tab: one user may have several concurrent sockets.
 */
const adminSockets = new Map();

/**
 * Register an admin socket.
 */
const addAdminSocket = (userId, socketId) => {
    if (!adminSockets.has(userId)) {
        adminSockets.set(userId, new Set());
    }
    adminSockets.get(userId).add(socketId);
};

/**
 * Remove a specific socket (on disconnect).
 */
const removeSocket = (userId, socketId) => {
    const sockets = adminSockets.get(userId);
    if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
            adminSockets.delete(userId);
        }
    }
};

/**
 * Emit an event to every connected admin socket.
 */
export const emitToAdmins = (event, payload) => {
    if (!io) return;

    for (const [, socketIds] of adminSockets) {
        for (const socketId of socketIds) {
            io.to(socketId).emit(event, payload);
        }
    }
};

/**
 * Get the number of currently connected admins (for debugging/health).
 */
export const connectedAdminCount = () => adminSockets.size;

/**
 * Initialize the Socket.io server.
 * Must be called once with the raw http.Server instance.
 */
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // ── JWT auth middleware ──────────────────────────────────────────────────
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentication token missing'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Fetch fresh role from DB
            const result = await pool.query(
                'SELECT id, email, role FROM users WHERE id = $1',
                [decoded.id]
            );
            if (result.rows.length === 0) {
                return next(new Error('User no longer exists'));
            }
            
            socket.user = result.rows[0]; // Attach database user payload to socket
            next();
        } catch (err) {
            next(new Error('Invalid or expired token'));
        }
    });

    // ── Connection handler ───────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const { id: userId, role } = socket.user;

        if (role === ROLES.ADMIN) {
            addAdminSocket(userId, socket.id);
            console.log(`[Socket] Admin connected: userId=${userId} socketId=${socket.id}`);
        } else {
            console.log(`[Socket] User connected: userId=${userId} socketId=${socket.id}`);
        }

        socket.on('disconnect', () => {
            if (role === ROLES.ADMIN) {
                removeSocket(userId, socket.id);
                console.log(`[Socket] Admin disconnected: userId=${userId} socketId=${socket.id}`);
            }
        });
    });

    console.log('[Socket] Socket.io server initialized');
    return io;
};
