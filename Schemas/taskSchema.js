import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  Heading: {
    type: String,
    required: true,
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
  Owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

const task = mongoose.model("Tasks", taskSchema);

export default task;
