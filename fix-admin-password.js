// fix-admin-password.js
// Updates the admin password in the NEW admins table (after the table split migration)

const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edunova_university'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }

    console.log('Connected to MySQL database');
    console.log('Updating admin password in admins table...');

    bcrypt.hash('admin123', 10).then(hash => {
        // Target the admins table (not users)
        const query = "UPDATE admins SET password = ? WHERE email = 'admin@edunova.edu'";

        connection.query(query, [hash], (err, results) => {
            if (err) {
                console.error('Error updating password:', err);
                connection.end();
                process.exit(1);
            }

            if (results.affectedRows === 0) {
                console.log('⚠️  Admin user not found in admins table.');
                console.log('    Run the migrate-split-tables.sql migration first.');
            } else {
                console.log('✓ Admin password updated successfully!');
                console.log('  Table:    admins');
                console.log('  Email:    admin@edunova.edu');
                console.log('  Password: admin123');
            }

            connection.end();
            console.log('\nPassword fix completed!');
        });
    }).catch(err => {
        console.error('Error generating hash:', err);
        connection.end();
        process.exit(1);
    });
});