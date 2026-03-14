// fix-sample-passwords.js
// Resets sample passwords after the table split migration.
// Admin row is now in the admins table; student row is in the users table.

const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edunova_university',
});

async function run() {
    const adminEmail   = 'admin@edunova.edu';
    const studentEmail = 'john.doe@example.com';

    const adminHash   = await bcrypt.hash('admin123', 10);
    const studentHash = await bcrypt.hash('student123', 10);

    // Admin lives in the admins table now
    await new Promise((resolve, reject) => {
        connection.query(
            'UPDATE admins SET password = ? WHERE email = ?',
            [adminHash, adminEmail],
            (err, result) => {
                if (err) return reject(err);
                console.log(`✓ Admin password reset (${result.affectedRows} row(s)) -> ${adminEmail} / admin123`);
                resolve();
            }
        );
    });

    // Students still live in the users table
    await new Promise((resolve, reject) => {
        connection.query(
            'UPDATE users SET password = ? WHERE email = ?',
            [studentHash, studentEmail],
            (err, result) => {
                if (err) return reject(err);
                console.log(`✓ Student password reset (${result.affectedRows} row(s)) -> ${studentEmail} / student123`);
                resolve();
            }
        );
    });
}

connection.connect(async (err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    try {
        console.log('Connected to MySQL database');
        await run();
    } catch (e) {
        console.error('Error fixing sample passwords:', e);
        process.exitCode = 1;
    } finally {
        connection.end();
        console.log('Done.');
    }
});