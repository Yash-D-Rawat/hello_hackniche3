import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectToDatabase from "./config/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed request methods
    credentials: true, // Allow cookies, authentication headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("Welcome to the CONTENT WRITER API!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Content Writer API is running on http://localhost:${PORT}`);

  await connectToDatabase();
});

export default app;
