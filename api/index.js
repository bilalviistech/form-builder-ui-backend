import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRoutes from '../routes/api'

const app = express();

// ✅ CORS: production me env se control karna best hai
const allowedOrigins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like Postman)
            if (!origin) return callback(null, true);

            // if env not set, allow all (optional behavior)
            if (allowedOrigins.length === 0) return callback(null, true);

            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);

app.use(express.json());

// ✅ Mongo connection: serverless me connection reuse karni hoti hai
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing in environment variables.");
        }

        mongoose.set("strictQuery", false);
        mongoose.set("strictPopulate", false);

        cached.promise = mongoose.connect(MONGO_URI).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// ✅ Ensure DB connected for every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

// Routes
app.use("/api", apiRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Something went wrong!" });
});

// ✅ IMPORTANT: export app (NO app.listen)
export default app;