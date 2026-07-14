import express from "express";
import dotenv from "dotenv";
import connectDB from "./ConnectDatabase.js";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

//Schemas
import testing from "./Schemas/testingschema.js";

// Routes
import {
  setTask,
  getAllTask,
  updateTask,
  deleteTask,
} from "./Routes/taskFunctions.js";

import { signUpUser, logInUser } from "./Routes/userFunctions.js";

// 1. Initialize dotenv FIRST
dotenv.config();

// 2. Connect to DB SECOND (now it can see your MONGO_URI)
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again after 15 minutes."
  }
});
app.use("/api", limiter);

// I must use this "middle ware" when ever I am dealing with the json files
app.use(express.json());

// This is just a testing API
app.get("/api/test", async (req, res) => {
  try {
    const fetched = await testing.findOne();
    console.log(fetched);
    res.status(200).json(fetched);
  } catch (e) {
    res.status(500).json({ error: "Failed to Fetch" });
  }
});

// --------------------------- API ----------------------------------

app.get("/api/getAllTask", getAllTask);
app.post("/api/addTask", setTask);
app.put("/api/update/:id", updateTask);
app.delete("/api/delete/:id", deleteTask);

app.post("/api/signup", signUpUser);
app.post("/api/login", logInUser);

// Start the server at the given port stored in the env file
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server: http://localhost:${port}/api/test`);
});
