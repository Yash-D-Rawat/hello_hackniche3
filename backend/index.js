import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectToDatabase from "./config/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import documentDb from "./models/document.db.js";

const app = express();

// Setup CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Update frontend URL if needed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

// Error Middleware
app.use(errorMiddleware);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the CONTENT WRITER API!");
});

// Create HTTP server from Express app
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Match frontend URL
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("get-document", async (documentId) => {
    if (!documentId) return;

    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await documentDb.findByIdAndUpdate(documentId, { data });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Helper function to find or create a document
async function findOrCreateDocument(id) {
  if (!id) return null;

  const document = await documentDb.findById(id);
  if (document) return document;

  return await documentDb.create({ _id: id, data: defaultValue });
}

// Start Server & Database Connection
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
