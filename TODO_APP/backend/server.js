// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Creating an instance of Express
const app = express();

// Loading environment variables from a .env file into process.env
require("dotenv").config();

// Importing the Firestore database instance from firebase.js
const db = require("./firebase");

// Middlewares to handle cross-origin requests and to parse the body of incoming requests to JSON
app.use(cors());
app.use(bodyParser.json());

// Your API routes will go here...

// root route
app.get("/", (req, res) => {
  res.send("Hello, the backend is working!");
});

// GET: Endpoint to retrieve all tasks
app.get("/tasks", async (req, res) => {
  try {
    // Fetching all documents from the "tasks" collection in Firestore
    const snapshot = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .get();    

    let tasks = [];
    // Looping through each document and collecting data
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,  // Document ID from Firestore
        ...doc.data(),  // Document data
      });
    });
    
    // Sending a successful response with the tasks data
    res.status(200).send(tasks);
  } catch (error) {
    // Sending an error response in case of an exception
    res.status(500).send(error.message);
  }
});

// GET: Endpoint to retrieve all tasks for a user
app.get("/tasks/:currentUser", async (req, res) => {
  const { currentUser } = req.params;

  console.log("GET Request received");
  console.log("User ID:", currentUser);

  try {
    const snapshot = await db
      .collection("users")
      .doc(currentUser)
      .collection("tasks")
      .get();
    
    let tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id, 
        ...doc.data(),
      });
    });

    res.status(200).send(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
})


// POST: Endpoint to add a new task
app.post("/tasks", async (req, res) => {
  const { userId, text, completed } = req.body;

  console.log("Request Body:", req.body);

  if (!userId || !text) {
    console.error("Validation Error: Missing userId or text");
    return res.status(400).json({ error: "userId and text are required." });
  }

  try {
    console.log("Starting to add task...");

    // Adding a new document to the "tasks" collection
    const docRef = await db
      .collection("users")
      .doc(userId)
      .collection("tasks")
      .add({
      userId,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    });

    console.log("Task added with ID:", docRef.id);

    // Sending a successful response with the new task ID
    res.status(201).send({ id: docRef.id, userId, text, completed });
  } catch (error) {
    // Sending an error response in case of an exception
    res.status(500).send(error.message);
  }
});

// DELETE: Endpoint to remove a task
app.delete("/tasks/:currentUser/:taskId", async (req, res) => {
  const { currentUser, taskId } = req.params;

  console.log("DELETE Request received");
  console.log("User ID:", currentUser);
  console.log("Task ID:", taskId);


  try {
    // Deleting the document with the specified ID from the "tasks" collection
    console.log("Request Body:", req.body);

    const taskRef = await db
      .collection("users")
      .doc(currentUser)
      .collection("tasks")
      .doc(taskId)
      .delete()
      .then(() => {
        console.log("success delete");
      })

    // await deleteDoc(doc(taskRef, id));

    // Sending a successful response
    console.log("Task deleted:", taskId);
    res.status(200).send({ message: "Task deleted successfully." });
  } catch (error) {
    // Sending an error response in case of an exception
    res.status(500).send(error.message);
  }
});

// Setting the port for the server to listen on
const PORT = process.env.PORT || 3001;
// Starting the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// app.put("/tasks/:taskId", async (req, res) => {
//   const { taskId } = req.params;  // Get taskId from the URL
//   const { userId, completed } = req.body;  // Get userId and completed from the body

//   console.log("Updating task:", taskId);
//   console.log("Request Body:", req.body);

//   try {
//     const taskRef = await db
//       .collection("users")
//       .doc(userId)  // Use userId to access the correct user's task collection
//       .collection("tasks")
//       .doc(taskId);  // Reference the specific task by taskId

//     // Update the task's completed status in Firestore
//     await taskRef.update({
//       completed: completed !== undefined ? completed : false,  // Toggle completed status
//     });

//     // Send back the updated task
//     res.status(200).json({
//       id: taskId,
//       userId,
//       completed,
//     });
//   } catch (error) {
//     console.error("Error updating task:", error.message);
//     res.status(500).json({
//       error: "Failed to update task",
//       details: error.message,
//     });
//   }
// });
