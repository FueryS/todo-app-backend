import user from "../Schemas/userSchema.js";
import task from "../Schemas/taskSchema.js";

import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

// -------------- HELPER FUNCTIONS ----------------

/*
CHECKS IF THE JWT IS VALID: returns:
    -  JWT is invalid: [false]
    -  JWT is valid:   [true,_id]
*/
// (for now it just validates the _id jwt will be implemented in future)

async function validateJwt(jwt, res) {
  // Ensure JWT has been sent
  if (!jwt) {
    res.status(400).json({
      error: "Missing JWT",
      message: "Please enter a valid JWT token",
    });
    return [false];
  }

  // Check JWT format
  if (!ObjectId.isValid(jwt)) {
    res.status(400).json({
      error: "Invalid JWT",
      message: "Please enter a valid JWT token",
    });

    return [false];
  }

  // Chaeck JWT is valid
  const exist = await user.findOne({
    _id: new ObjectId(jwt),
  });
  if (exist) return [true, jwt];
  else {
    res.status(400).json({
      error: "Missing JWT",
      message: "Please enter a valid JWT token",
    });
    return [false];
  }

  // Default return is false
  return [false];
}

// Date sanitization
async function saintizeDate(incomingDate) {
  // Default date
  let taskDate = null;

  // Ensure date exists
  if (incomingDate == null || incomingDate == "" || !incomingDate) return null;

  // Create date object
  taskDate = new Date(incomingDate);

  // Check if date is valid
  if (isNaN(taskDate.getTime())) {
    return null;
  }

  // Check what date is today
  const today = new Date();

  // Set today to start of day for proper comparison
  today.setHours(0, 0, 0, 0);

  // Set taskDate to start of day too
  taskDate.setHours(0, 0, 0, 0);

  // Compare
  if (taskDate < today) {
    // Set to tomorrow if past date
    taskDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }

  return taskDate;
}

// This file should have all the functions used for tasks

// Chenage this logic after login functions are created : done : still testing : yet to test in UI
export async function setTask(req, res) {
  try {
    // Load everything in default order
    let { Heading, Discription, Date: incomingDate, status } = req.body;
    const jwt = req.headers.authorization;

    // CHeck if the JWT is valid
    const valid = await validateJwt(jwt, res);
    if (valid[0] === false) return;

    // Store the _id to owner
    const owner = new ObjectId(valid[1]);
    // console.log(owner);

    // Set default date to null
    let taskDate = await saintizeDate(incomingDate);

    // Create query
    const newEntry = new task({
      Heading,
      Discription,
      Date: taskDate,
      status: false,
      Owner: owner,
    });

    // Save query
    const savedEntry = await newEntry.save();
    console.log(savedEntry);

    const obj = savedEntry.toObject();
    delete obj.Owner;
    delete obj.__v;

    res.status(201).json(obj);
  } catch (e) {
    console.log("Entry Failed: ", e);
    res.status(400).json({ error: "Creation failed", message: e.message });
  }
}

// Chenage this logic after login functions are created : done : still testing : yet to test in UI
export async function getAllTask(req, res) {
  try {
    // JWT Validation and fetching
    const jwt = req.headers.authorization;
    let owner = await validateJwt(jwt, res);
    if (owner[0] === false) return;

    // Turn the owner from array to variable with _id
    owner = new ObjectId(owner[1]);
    // console.log(owner);
    const data = await task.find({ Owner: owner }).select("-Owner");

    if (data.length === 0)
      return res.status(200).json({
        Heading: "Welcome",
        Discription:
          "Add your very first task and take a step towards a productive future!!",
        Date: new Date().toDateString(),
        status: false,
      });
    res.status(200).json(data);
  } catch (e) {
    console.log("Fetching failed: ", e);
    res.status(500).json({ error: "Fetch failed" });
  }
}

// Chenage this logic after login functions are created : done : still testing : yet to test in UI
export async function updateTask(req, res) {
  try {
    const jwt = req.headers.authorization;

    // Check if the JWT is valid
    const valid = await validateJwt(jwt, res);
    if (valid[0] === false) return;

    const owner = valid[1];
    // The new is required so the return value is actually the new value other wise it will return the previous value
    const updated = await task.findOneAndUpdate(
      {
        _id: req.params.id,
        Owner: owner,
      },
      {
        status: req.body.status,
      },
      { new: true },
    );

    if (!updated) {
      res.status(404).json({
        error: "Updating failed",
        message: "Ensure the given ID for the task is valid",
      });
      console.log("Update failed");
    }
    console.log("Updated!!! ", updated);

    const obj = updated.toObject();
    delete obj.Owner;
    delete obj.__v;
    res.status(200).json(obj);
  } catch (e) {
    console.log("Updating failed: ", e);
    res.status(400).json({ error: "Update failed" });
  }
}

// Chenage this logic after login functions are created : done : still testing : yet to test in UI
export async function deleteTask(req, res) {
  try {
    const jwt = req.headers.authorization;

    // Check if the JWT is valid
    const valid = await validateJwt(jwt, res);
    if (valid[0] === false) return;

    const owner = valid[1];

    const deleted = await task.findOneAndDelete({
      _id: req.params.id,
      Owner: owner,
    });

    if (!deleted) {
      console.log("Deletion failed");

      return res.status(404).json({
        error: "Deletion failed",
        message: "Ensure the given ID for the task is valid",
      });
    }

    console.log("Deleted!!! ", deleted);

    const obj = deleted.toObject();
    delete obj.Owner;
    delete obj.__v;

    res.status(200).json({ message: "Deletion Completed" });
  } catch (e) {
    console.log("Deletion failed: ", e);
    res.status(500).json({ error: "Deletion failed" });
  }
}
