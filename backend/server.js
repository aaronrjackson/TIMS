const express = require("express");
const db = require('./db/database');
const dbPath = db.dbPath; // Access the custom property you added
console.log("Database connection", dbPath);
if (!db) {
    console.error('Database connection failed!');
    process.exit(1); // Exit if no database connection
  }
const app = express();
const PORT = 3001;

// ---- // ---- // ---- //

// Middleware to parse JSON
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Route to test API
app.get("/", (req, res) => {
    res.send("Hello, Backend!");
});

app.post('/api/threats', (req, res) => {
    const { name, description, status, categories } = req.body;
  
    // Validation
    if (!name?.trim() || !description?.trim() || !status || !categories?.length) {
      return res.status(400).json({ 
        error: 'All fields are required and cannot be empty' 
      });
    }
  
    if (!['Potential', 'Active', 'Resolved'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value' 
      });
    }
  
    db.run(
      `INSERT INTO threats (name, description, status, categories)
       VALUES (?, ?, ?, ?)`,
      [name, description, status, JSON.stringify(categories)],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            error: 'Failed to save threat to database',
            details: err.message 
          });
        }
  
        res.status(201).json({
          id: this.lastID,
          name,
          description,
          status,
          categories,
          created_at: new Date().toISOString(),
          message: 'Threat submitted successfully'
        });
      }
    );
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
});