import { Schema, model } from "mongoose";

// Define the Document Schema
const DocumentSchema = new Schema({
  _id: String,  // Custom unique identifier (usually not necessary, MongoDB does this automatically)
  data: Object,  // This field will hold the document's actual content (e.g., text, metadata, etc.)
  userid: { 
    type: Schema.Types.ObjectId,  // MongoDB ObjectId type to reference another document
    ref: 'User',  // This field is a reference to the 'User' model (where user data is stored)
  }
});

// Create and export the Document model using the schema
export default model("Document", DocumentSchema);
