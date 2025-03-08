import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email."],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    profilePic: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, " Please enter a valid phone number"],
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    socialLinks: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
