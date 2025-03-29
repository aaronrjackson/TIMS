const db = require('./db');

function getUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { getUsers };