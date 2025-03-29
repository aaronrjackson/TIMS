const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// create a connection to the SQLite database
const dbPath = path.resolve(__dirname, 'database.db');  // database file will be created here
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database');
    }
});

// create threats table
const createTable = () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS threats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        assessment INTEGER NOT NULL,
        is_resolved INTEGER NOT NULL, -- 0 represents not resolved, 1 represents resolved
    )
  `;
    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating \'threats\' table:', err.message);
        } else {
            console.log('\'threats\' table created or already exists');
        }
    });
};

// call createTable to ensure the table exists when the app starts
createTable();

// export the database connection so it can be used in other files (e.g., for queries)
module.exports = {
    db
};
