
import Chat from "../models/chat.db";
import User from "../models/user.db.js";
import mongoose from "mongoose";

// Simple AI response generator function (placeholder for actual AI integration)
const generateAIResponse = async (message, mode) => {
  // This would be replaced with your actual AI integration
  const responses = {
    standard: `This is a standard response to: "${message}"`,
    poetic: `In words of rhythm and rhyme,\nI ponder upon your query divine: "${message}"`,
    script: `CHARACTER: (thoughtfully)\nHmmm, let me think about "${message}"...\n\nCHARACTER: (decisively)\nHere's what I think...`,
    sentiment: `Analyzing sentiment for: "${message}"\nSentiment: Mixed (0.23)\nKey entities detected: 2`,
    scene: `SCENE: Interior - Library - Day\n\nThe protagonist contemplates "${message}" while gazing through dusty bookshelves...`
  };
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return responses[mode] || responses.standard;
};

export const chatController = {
  // Get all chats for a user
  getUserChats: async (req, res) => {
    try {
      const {userId} = req.body; // Assuming authentication middleware sets this
      
      const chats = await Chat.find({ owner: userId })
        .select('title mode lastActive createdAt')
        .sort({ lastActive: -1 });
      
      return res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return res.status(500).json({ error: "Failed to fetch chats" });
    }
  },
  
  // Get a single chat by ID
  getChatById: async (req, res) => {
    try {
      const { chatId } = req.params;
      const {userId} = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const chat = await Chat.findOne({ _id: chatId, owner: userId });
      
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      return res.status(500).json({ error: "Failed to fetch chat" });
    }
  },
  
  // Create a new chat
  createChat: async (req, res) => {
    try {
      const { title, mode = "standard" } = req.body;
      const {userId} = req.body;
      
      const chat = new Chat({
        title: title || "New Chat",
        owner: userId,
        mode,
        messages: []
      });
      
      await chat.save();
      
      return res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      return res.status(500).json({ error: "Failed to create chat" });
    }
  },
  
  // Send a message and get AI response
  sendMessage: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { content, userId } = req.body;
      
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Message content is required" });
      }
      
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const chat = await Chat.findOne({ _id: chatId, owner: userId });
      
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      // Add user message
      chat.messages.push({
        sender: userId,
        content,
        messageType: "text"
      });
      
      // Generate AI response
      const aiResponse = await generateAIResponse(content, chat.mode);
      
      // Add AI message
      chat.messages.push({
        sender: userId, // Using same user ID but differentiated by messageType
        content: aiResponse,
        messageType: "ai"
      });
      
      // Update last active timestamp
      chat.lastActive = Date.now();
      
      await chat.save();
      
      // Return the two new messages
      const newMessages = chat.messages.slice(-2);
      
      return res.status(200).json(newMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }
  },
  
  // Update chat properties (title, mode)
  updateChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      const { title, mode } = req.body;
      const userId = req.userId;
      
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const chat = await Chat.findOne({ _id: chatId, owner: userId });
      
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      if (title) chat.title = title;
      if (mode) chat.mode = mode;
      
      await chat.save();
      
      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error updating chat:", error);
      return res.status(500).json({ error: "Failed to update chat" });
    }
  },
  
  // Delete a chat
  deleteChat: async (req, res) => {
    try {
      const { chatId } = req.params;
      const userId = req.userId;
      
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const result = await Chat.findOneAndDelete({ _id: chatId, owner: userId });
      
      if (!result) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      return res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat:", error);
      return res.status(500).json({ error: "Failed to delete chat" });
    }
  }
};

export default chatController;