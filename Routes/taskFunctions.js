import task from "../Schemas/taskSchema.js";

export async function setTask(req, res) {
  try {
    let { Heading, Discription, Date: incomingDate, status } = req.body;

    let taskDate = null;
    // Date checking Logic
    if (incomingDate != null) {
      // Fix the null date problem
      const today = new Date();
      taskDate = new Date(incomingDate);

      today.setHours(0, 0, 0, 0);

      if (taskDate < today) {
        taskDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    const newEntry = new task({
      Heading,
      Discription,
      Date: taskDate,
      status: false,
    });

    const savedEntry = await newEntry.save();
    console.log(savedEntry);

    res.status(201).json(savedEntry);
  } catch (e) {
    console.log("Entry Failed: ", e);
    res.status(400).json({ error: "Creation failed", message: e.message });
  }
}

export async function getAllTask(req, res) {
  try {
    const data = await task.find();
    res.status(200).json(data);
  } catch (e) {
    console.log("Fetching failed: ", e);
    res.status(500).json({ error: "Fetch failed" });
  }
}

export async function updateTask(req, res) {
  try {
    const updated = await task.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });

    if (!updated) {
      res.status(404);
      console.log("Update failed");
    }

    console.log("Updated!!! ", updated);
    res.status(200).json(updated);
  } catch (e) {
    console.log("Updating failed: ", e);
    res.status(400).json({ error: "Update failed" });
  }
}

export const deleteTask = async (req, res) => {
  try {
    const deleted = await task.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: "Deletion failed" });
  }
};
