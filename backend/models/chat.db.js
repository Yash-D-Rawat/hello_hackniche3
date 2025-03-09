import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    messageType: {
      type: String,
      enum: ["text", "ai"],
      default: "text"
    }
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mode: {
      type: String,
      enum: ["standard", "poetic", "script", "sentiment", "scene"],
      default: "standard"
    },
    messages: [messageSchema],
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Pre-save hook to set default title based on first message if not provided
chatSchema.pre("save", function(next) {
  if (this.isNew && this.title === "New Chat" && this.messages.length > 0) {
    // Set title to first 30 characters of first message
    this.title = this.messages[0].content.substring(0, 30);
    if (this.messages[0].content.length > 30) {
      this.title += "...";
    }
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;