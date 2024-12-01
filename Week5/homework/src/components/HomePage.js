import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Grid,
} from "@mui/material";
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from "react";
import { fetchTasks, addTask, deleteTask, completeTask } from "../api";

export default function HomePage() {
  const navigate = useNavigate();
  const {currentUser} = useAuth()

  // State to hold the list of tasks.
  const [taskList, setTaskList] = useState([]);

  // State for the task name being entered by the user.
  const [newTaskName, setNewTaskName] = useState("");

  // TODO: Support retrieving your todo list from the API.
  // Currently, the tasks are hardcoded. You'll need to make an API call
  // to fetch the list of tasks instead of using the hardcoded data.
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    } else {
      fetch(`http://localhost:3001/tasks/${currentUser}`)  // Use currentUser to fetch tasks for the logged-in user
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched tasks:", data);  // Log the fetched tasks
        setTaskList(data);  // Set the tasks to state
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
    }
  }, [currentUser]);

  function handleAddTask() {
    if (newTaskName && !taskList.some((task) => task.name === newTaskName)) {
      if (!currentUser) {
        console.error("User ID is not available");
        return; // Don't proceed if user ID is missing
      }
      
      fetch(`http://localhost:3001/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
        body: JSON.stringify({
          userId: currentUser, // Use appropriate user ID
          text: newTaskName,
          completed: false,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to add task: ${response.statusText}`);
          }
          return response.json(); // Parse the JSON response
        })
        .then((data) => {
          setTaskList([...taskList, data]); // Update the task list
          setNewTaskName(""); // Clear the input field
        })
        .catch((error) => {
          console.error("FAILED TO POST:", error);
        });
    } else if (taskList.some((task) => task.name === newTaskName)) {
      alert("Task already exists!");
    }
  }

  // Function to toggle the 'finished' status of a task.
  function toggleTaskCompletion(task) {
    fetch(`http://localhost:3001/tasks/${currentUser}/${task.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then(() => {
        const updatedTaskList = taskList.map((existingTask) =>
          existingTask.id === task.id
            ? { ...existingTask, finished: true}
            : existingTask
        );
        setTaskList(updatedTaskList);
      })
      .catch((error) => console.error("FAILED TO TOGGLE: ", error));
    }
    // TODO: Support removing/checking off todo items in your todo list through the API.
    // Similar to adding tasks, when checking off a task, you should send a request
    // to the API to update the task's status and then update the state based on the response.
  // Function to compute a message indicating how many tasks are unfinished.
  function getUnfinishedTaskMessage() {
    if (!Array.isArray(taskList)) return "no tasks";

    const unfinishedTasks = taskList.filter((task) => !task.finished).length;
    return unfinishedTasks === 1
      ? `You have 1 unfinished task`
      : `You have ${unfinishedTasks} tasks left to do`;
  }

  return (
    <>
      <Header />
      <Container component="main" maxWidth="sm">
        {/* Main layout and styling for the ToDo app. */}
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Display the unfinished task summary */}
          <Typography variant="h4" component="div" fontWeight="bold">
            {getUnfinishedTaskMessage()}
          </Typography>
          <Box
            sx={{
              width: "100%",
              marginTop: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Input and button to add a new task */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small" // makes the textfield smaller
                  value={newTaskName}
                  placeholder="Type your task here"
                  onChange={(event) => setNewTaskName(event.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTask}
                  fullWidth
                >
                  Add
                </Button>
              </Grid>
            </Grid>
            {/* List of tasks */}
            <List sx={{ marginTop: 3 }}>
              {taskList.map((task) => (
                <ListItem
                  key={task.text}
                  dense
                >
                  <Checkbox
                    checked={task.finished}
                    onChange={() => toggleTaskCompletion(task)}
                  />
                  <ListItemText primary={task.text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Container>
    </>
  );
}