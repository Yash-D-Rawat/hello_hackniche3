import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectToDatabase from "./config/mongodb.js";
import errorMiddleware from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import documentDb from "./models/document.db.js";
import DocumentVersion from "./models/documentVersion.js";

const app = express();

// Setup CORS
app.use(
  cors({
    origin: "http://localhost:5175", // Update frontend URL if needed
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
    origin: "http://localhost:5175", // Match frontend URL
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

    // Get versions list for this document
    const versions = await DocumentVersion.find({ documentId })
      .sort({ versionNumber: -1 })
      .limit(20) // Limit to recent 20 versions
      .select("versionNumber createdAt description");

    socket.emit("document-versions", versions);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      // First update the main document
      await documentDb.findByIdAndUpdate(documentId, { data });

      // Then create a new version
      // Get the current highest version number
      const latestVersion = await DocumentVersion.findOne({ documentId }).sort({
        versionNumber: -1,
      });

      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // Store the new version
      await DocumentVersion.create({
        documentId,
        data,
        versionNumber,
        createdBy: socket.userId, // You'll need to set this when auth is implemented
        description: `Auto-saved version ${versionNumber}`,
      });

      // Notify all clients in the room about the new version
      io.to(documentId).emit("version-created", {
        versionNumber,
        createdAt: new Date(),
        description: `Auto-saved version ${versionNumber}`,
      });
    });

    // New handler for version management
    socket.on("get-version", async ({ documentId, versionNumber }) => {
      const version = await DocumentVersion.findOne({
        documentId,
        versionNumber,
      });
      if (version) {
        socket.emit("load-version", version.data);
      }
    });

    // Allow user to save a version with custom description
    socket.on("save-version", async ({ documentId, data, description }) => {
      const latestVersion = await DocumentVersion.findOne({ documentId }).sort({
        versionNumber: -1,
      });

      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      await DocumentVersion.create({
        documentId,
        data,
        versionNumber,
        createdBy: socket.userId, // Will be set with auth
        description: description || `Version ${versionNumber}`,
      });

      // Notify all clients
      const newVersion = {
        versionNumber,
        createdAt: new Date(),
        description: description || `Version ${versionNumber}`,
      };

      io.to(documentId).emit("version-created", newVersion);

      return newVersion;
    });

    // Add user authentication to socket connection
    socket.on("set-user", (userId) => {
      socket.userId = userId;
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
