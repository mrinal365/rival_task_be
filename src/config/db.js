import pkg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_DBPORT,
});

pool.on("connect", () => {
    console.log("Connection pool established with database");
});

// Initialize database tables from init.sql
export const initDB = async () => {
    try {
        const sql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');
        await pool.query(sql);
        console.log("Database tables initialized successfully");
    } catch (err) {
        console.error("Error initializing database tables:", err.message);
        throw err;
    }
};

export default pool;