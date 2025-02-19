const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser');

// Load environment variables from .env file
dotenv.config();

const routes = require('./routes/routes.js');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors({
    credentials: true,
    origin: ['*']
}));

app.use(cookieParser());

// Middleware
app.use(express.json()); // To parse JSON requests

app.use('/api', routes);


// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
    res.send("API is running...");
  });

  // Start Server
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));