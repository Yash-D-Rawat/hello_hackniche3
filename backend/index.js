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

app.use(
  cors({
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // ⚠️ Note: `credentials: true` does not work with `origin: "*"`
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
      try {
        // First update the main document
        await documentDb.findByIdAndUpdate(documentId, { data });

        // Then create a new version
        // Get the current highest version number
        const latestVersion = await DocumentVersion.findOne({
          documentId,
        }).sort({
          versionNumber: -1,
        });

        const versionNumber = latestVersion
          ? latestVersion.versionNumber + 1
          : 1;

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
      } catch (error) {
        console.error("Error in save-document:", error);
        socket.emit("error", { message: "Failed to save document" });
      }
    });

    // New handler for version management
    socket.on("get-version", async ({ documentId, versionNumber }) => {
      try {
        const version = await DocumentVersion.findOne({
          documentId,
          versionNumber,
        });
        if (version) {
          socket.emit("load-version", version.data);
        } else {
          socket.emit("error", { message: "Version not found" });
        }
      } catch (error) {
        console.error("Error in get-version:", error);
        socket.emit("error", { message: "Failed to retrieve version" });
      }
    });

    // Allow user to save a version with custom description
    socket.on("save-version", async ({ documentId, data, description }) => {
      try {
        const latestVersion = await DocumentVersion.findOne({
          documentId,
        }).sort({
          versionNumber: -1,
        });

        const versionNumber = latestVersion
          ? latestVersion.versionNumber + 1
          : 1;

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
      } catch (error) {
        console.error("Error in save-version:", error);
        socket.emit("error", { message: "Failed to save version" });
      }
    });

    // Add new handler for restoring a version as the current document
    socket.on(
      "restore-version",
      async ({ documentId, data, restoredFromVersion }) => {
        try {
          // 1. Update the main document with the version data
          await documentDb.findByIdAndUpdate(documentId, { data });

          // 2. Create a new version entry indicating this is restored from a previous version
          const latestVersion = await DocumentVersion.findOne({
            documentId,
          }).sort({
            versionNumber: -1,
          });

          const versionNumber = latestVersion
            ? latestVersion.versionNumber + 1
            : 1;

          // Create a new version that shows it was restored from a previous version
          await DocumentVersion.create({
            documentId,
            data,
            versionNumber,
            createdBy: socket.userId,
            description: `Restored from version ${restoredFromVersion}`,
          });

          // 3. Notify all connected clients about the update
          const restoredVersion = {
            versionNumber,
            createdAt: new Date(),
            description: `Restored from version ${restoredFromVersion}`,
          };

          // Notify about the new version created
          io.to(documentId).emit("version-created", restoredVersion);

          // Broadcast the restored document to all clients (including the requester)
          io.to(documentId).emit("load-document", data);

          // Send specific success message to the client that requested the restore
          socket.emit("version-restored", {
            success: true,
            message: `Successfully restored from version ${restoredFromVersion}`,
            versionNumber: restoredVersion.versionNumber,
          });
        } catch (error) {
          console.error("Error in restore-version:", error);
          socket.emit("error", { message: "Failed to restore version" });
        }
      }
    );

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
