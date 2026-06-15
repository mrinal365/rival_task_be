import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"

import errorHandling from './middlewares/error.middleware.js';
import pool from './config/db.js';

dotenv.config();

// setting up server
const app = express();
const port = process.env.PORT || 5001

// middlewares
app.use(express.json())
app.use(cors())


// error handling middlewares
app.use(errorHandling)

// health route
app.get("/health", async (req, res) => {
    const result = await pool.query("SELECT current_database()")
    res.send("server is running and database name is " + result.rows[0].current_database.toString())
});

// server running
app.listen(port, () => {
    console.log(`server is running at port: ${port}`)
})