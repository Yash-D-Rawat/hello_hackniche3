import { Schema, model } from "mongoose";

const DocumentVersionSchema = new Schema({
  documentId: {
    type: String,
    required: true,
    ref: "Document",
  },
  data: {
    type: Object,
    required: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: "",
  },
});

// Create a compound index for efficient querying
DocumentVersionSchema.index(
  { documentId: 1, versionNumber: 1 },
  { unique: true }
);

export default model("DocumentVersion", DocumentVersionSchema);
