const express = require("express");
const db = require('./db/database'); // Import the database connection
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello, Backend!");
});

// Database inspection endpoint
app.get("/database-info", (req, res) => {
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            message: "Database connection active",
            path: db.dbPath, // Use our custom property
            tables: row ? row.name : 'No tables found'
        });
    });
});

// Get all threats
app.get('/threats', (req, res) => {
    db.all('SELECT * FROM threats', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Display formatted table in terminal
      console.table(rows.map(row => ({
        id: row.id,
        name: row.name,
        assessment: row.assessment,
        is_resolved: row.is_resolved ? '✅' : '❌',
        created_at: new Date(row.created_at).toLocaleString(),
        updated_at: new Date(row.updated_at).toLocaleString()
      })));
      
      // Still send JSON response to client
      res.json(rows);
    });
  });
  
  // Create new threat
  app.post('/threats', (req, res) => {
    const { name, assessment } = req.body;
    db.run(
      'INSERT INTO threats (name, assessment) VALUES (?, ?)',
      [name, assessment],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          id: this.lastID,
          name,
          assessment,
          status: 'created'
        });
      }
    );
  });
  
  // Update threat status
  app.patch('/threats/:id/resolve', (req, res) => {
    const { id } = req.params;
    db.run(
      'UPDATE threats SET is_resolved = 1 WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          changes: this.changes,
          status: 'resolved'
        });
      }
    );
  });
  
  // Delete threat
  app.delete('/threats/:id', (req, res) => {
    const { id } = req.params;
    db.run(
      'DELETE FROM threats WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({
          changes: this.changes,
          status: 'deleted'
        });
      }
    );
  });

// Start server
app.listen(PORT, () => {
    console.log(`Server is now running on http://localhost:${PORT}`);
    console.log(`Database file location: ${db.dbPath}`); // Now this will work
});