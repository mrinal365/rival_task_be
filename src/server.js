// import packages
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";

// import modules
import errorHandling from './middlewares/error.middleware.js';
import pool, { initDB } from './config/db.js';

// import routes
import taskRoutes from './modules/tasks/task.routes.js';
import authRoutes from './modules/auth/auth.routes.js';

// env variables setup
dotenv.config();

// setting up server
const app = express();
const port = process.env.PORT || 5001;

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// error handling middlewares
app.use(errorHandling);

// routes
app.use("/api/tasks", taskRoutes);

// error handling middlewares
app.use(errorHandling)

// health route
app.get("/health", async (req, res) => {
    const result = await pool.query("SELECT current_database()");
    res.send("server is running and database name is " + result.rows[0].current_database.toString());
});

// Initialize database and start server
const startServer = async () => {
    try {
        await initDB();
        app.listen(port, () => {
            console.log(`server is running at port: ${port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};

startServer();