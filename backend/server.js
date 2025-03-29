const express = require("express");
const { db } = require('./db/database'); // import functions from database.js
const app = express();
const PORT = 3000;

// ---- // ---- // ---- //

// Middleware to parse JSON
app.use(express.json());

// Route to test API
app.get("/", (req, res) => {
    res.send("Hello, Backend!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
});