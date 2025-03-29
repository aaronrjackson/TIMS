const sqlite3 = require('sqlite3').verbose();

// Connect to the database
let db = new sqlite3.Database('./database.db');

// Create a table
db.serialize(function() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users
    (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
});

// Insert data into the table
db.serialize(function() {
  db.run(`
    INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')
  `);
});

// Query the database
db.serialize(function() {
  db.all('SELECT * FROM users', function(err, rows) {
    if (err) {
      console.error('Error running query:', err);
    } else {
      console.log('Query results:', rows);
    }
  });
});

// Close the database connection
db.close();