import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001", // Backend server URL
});

// Fetch all tasks
export const fetchTasks = () => API.get("/tasks");

// Add a new task
export const addTask = (task) => API.post("/tasks", task);

// Delete a task
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Mark a task as completed
export const completeTask = (id) => API.put(`/tasks/${id}`, { completed: true });
