const express = require("express");
const app = express();
const userService = require('./userService');
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Route to test API
app.get("/", (req, res) => {
    res.send("Hello, Backend!");
});

// Route to test database connection
app.get("/users", async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.send(users);
    console.log(users);
  } catch (err) {
    console.error('Error running query:', err);
    res.status(500).send({ message: 'Database error' });
  }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});