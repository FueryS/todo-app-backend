import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  Heading: {
    type: String,
  },
  Discription: {
    type: String,
  },
  Date: {
    type: Date,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

const task = mongoose.model("Tasks", taskSchema);

export default task;
