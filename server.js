// File: server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://shreey94:19e6ycrpz09WOHVa@cluster0.wn4j5.mongodb.net/mytodo"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Task Schema
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Incomplete", "In Progress", "Completed"],
    default: "Incomplete",
  },
});

const Task = mongoose.model("Task", taskSchema);

// Routes

// Retrieve all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving tasks", error: err.message });
  }
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Task name is required" });
  }
  try {
    const task = new Task({ name, description });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Error adding task", error: err.message });
  }
});

// Update a task (name, description, or status)
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { name, description, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating task", error: err.message });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting task", error: err.message });
  }
});

// Search tasks
app.get("/api/tasks/search", async (req, res) => {
  const { q } = req.query;
  try {
    const tasks = await Task.find({
      $or: [{ name: new RegExp(q, "i") }, { description: new RegExp(q, "i") }],
    });
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error searching tasks", error: err.message });
  }
});

// Update task status
app.patch("/api/tasks/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["Incomplete", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating task status", error: err.message });
  }
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
