import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // process.env.MONGO_URI will work because we call config() in server.js first
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (e) {
    console.error("MongoDB connection error:", e.message);
    process.exit(1);
  }
};

export default connectDB;
