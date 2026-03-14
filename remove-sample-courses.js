const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edunova_university',
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }

  console.log('Connected to MySQL database');
  console.log('Deleting all courses (and cascading dependent applications)...');

  // applications.course_id has ON DELETE CASCADE, so deleting courses removes linked applications too
  const sql = `
    DELETE FROM courses;
    ALTER TABLE courses AUTO_INCREMENT = 1;
  `;

  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error deleting courses:', err);
      connection.end();
      process.exit(1);
    }

    // mysql2 returns an array of results for multi statements; first one is DELETE
    const deleteResult = Array.isArray(result) ? result[0] : result;
    console.log(`✓ Deleted courses: ${deleteResult.affectedRows}`);
    console.log('✓ Reset courses AUTO_INCREMENT to 1');
    connection.end();
    console.log('Done.');
  });
});

