const mysql = require('mysql2');

// Create a connection pool
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'sagarejo_tourism',
});

connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      return;
    }
    console.log('Connected to the database as ID', connection.threadId);
  });
  
  module.exports = connection;