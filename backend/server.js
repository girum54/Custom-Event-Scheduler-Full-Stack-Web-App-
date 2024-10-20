const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/event-scheduler", {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
const userRoutes = require("./routes/users");
const eventRoutes = require("./routes/events");

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
