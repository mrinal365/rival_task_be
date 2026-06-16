import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

import errorHandling from './middlewares/error.middleware.js';
import pool, { initDB } from './config/db.js';
import taskRoutes from './modules/tasks/task.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import imagekitRoutes from './modules/imagekit/imagekit.routes.js';
import { initSocket } from './socket/socket.manager.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/imagekit', imagekitRoutes);

// Error handling
app.use(errorHandling);

// Health check
app.get('/health', async (req, res) => {
    const result = await pool.query('SELECT current_database()');
    res.send('server is running and database name is ' + result.rows[0].current_database.toString());
});

// Initialize HTTP server (required for Socket.io)
const httpServer = createServer(app);

// Initialize database and start server
const startServer = async () => {
    try {
        await initDB();

        // Attach Socket.io to the http server
        initSocket(httpServer);

        httpServer.listen(port, () => {
            console.log(`server is running at port: ${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
};

startServer();