import mongoose from "mongoose";

const testingSchema = new mongoose.Schema({
  TestingResult: {
    type: Boolean,
    required: true,
  },
});

const testing = mongoose.model("testing", testingSchema, "testing");

export default testing;
