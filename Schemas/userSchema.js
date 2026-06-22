import mongoose from "mongoose";

// Add contact feature

const userSchema = new mongoose.Schema({
  UserName: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
});

const user = mongoose.model("Users", userSchema);

export default user;
