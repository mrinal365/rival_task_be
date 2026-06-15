import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"

dotenv.config();

// setting up server
const app = express();
const port = process.env.PORT || 5001

// middlewares
app.use(express.json())
app.use(cors())

// health route
app.get("/health", async (req, res) => {
    res.json({ success: true, message: "server is running", time: Date.now() })
});

// server running
app.listen(port, () => {
    console.log(`server is running at port: ${port}`)
})