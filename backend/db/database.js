const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Store the path for reference
db.dbPath = dbPath; // Add custom property to store the path

// Create tables and handle initialization
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS threats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      assessment INTEGER NOT NULL,
      is_resolved INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Database tables initialized');
    }
  });
});

module.exports = db;