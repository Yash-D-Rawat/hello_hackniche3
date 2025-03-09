import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();


// Routes
router.get("/", chatController.getUserChats);
router.get("/:chatId", chatController.getChatById);
router.post("/", chatController.createChat);
router.post("/:chatId/messages", chatController.sendMessage);
router.put("/:chatId", chatController.updateChat);
router.delete("/:chatId", chatController.deleteChat);

export default router;