const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database at', dbPath);
    createTables();
  }
});

function createTables() {
  
  db.run(`
      CREATE TABLE IF NOT EXISTS threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Potential', 'Active', 'Resolved')),
        categories TEXT NOT NULL,
        level INTEGER NOT NULL CHECK(level >= 1 AND level <= 5),
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating threats table:', err.message);
      } else {
        console.log('Successfully created threats table with correct schema');
      }
    });
   
    db.run(`
      CREATE TABLE IF NOT EXISTS threat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (threat_id) REFERENCES threats (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating threat_messages table:', err.message);
      } else {
        console.log('Successfully created threat_messages table');
      }
    });
    // In database.js, inside the createTables() function
    db.run(`
      CREATE TABLE IF NOT EXISTS threat_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        threat_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        username TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (threat_id) REFERENCES threats (id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating threat_logs table:', err.message);
      } else {
        console.log('Successfully created threat_logs table');
      }
    });
  }

module.exports = db;