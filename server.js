const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// MySQL Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edunova_university',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database successfully!');
    connection.release();
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// ==================== AUTH MIDDLEWARE ====================

// Verify JWT token — sets req.userId, req.userRole, req.userTable
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token.replace('Bearer ', ''), JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userId    = decoded.id;
        req.userRole  = decoded.role;   // 'student' | 'admin'
        req.userTable = decoded.role === 'admin' ? 'admins' : 'users';
        next();
    });
};

// Restrict a route to admins only
const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// ==================== FILE UPLOAD SETUP ====================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '';
        const safeExt = ['.pdf', '.jpg', '.jpeg', '.png'].includes(ext) ? ext : '';
        const rand = Math.random().toString(36).slice(2, 8);
        cb(null, `doc_${req.userId}_${Date.now()}_${rand}${safeExt}`);
    }
});

function fileFilter(req, file, cb) {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only PDF, JPG/JPEG, and PNG files are allowed'));
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==================== ROUTES ====================

app.get('/', (req, res) => {
    res.json({ message: 'EduNova University API Server is running!' });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register new STUDENT
// Admins are not self-registered; insert them directly in the admins table.
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check for duplicate email in BOTH tables
        db.query('SELECT id FROM users WHERE email = ?', [email], (err, studentRows) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (studentRows.length > 0) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            db.query('SELECT id FROM admins WHERE email = ?', [email], async (err, adminRows) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });

                if (adminRows.length > 0) {
                    return res.status(400).json({ message: 'User already exists with this email' });
                }

                // Hash password and generate student ID
                const hashedPassword = await bcrypt.hash(password, 10);
                const studentId = 'STU' + Date.now().toString().slice(-8);

                // Insert into users (students) table only
                const query = 'INSERT INTO users (name, email, password, phone, student_id) VALUES (?, ?, ?, ?, ?)';
                db.query(query, [name, email, hashedPassword, phone || null, studentId], (err, result) => {
                    if (err) return res.status(500).json({ message: 'Error creating user', error: err });

                    res.status(201).json({
                        message: 'User registered successfully',
                        studentId: studentId
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login — checks users table first, then admins table
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Helper that checks one table and calls back with (err, user, detectedRole)
        const checkTable = (table, detectedRole, cb) => {
            db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], cb);
        };

        // Try students first, then admins
        checkTable('users', 'student', async (err, studentRows) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            checkTable('admins', 'admin', async (err, adminRows) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });

                // Decide which row to use based on requested role (or whichever matches)
                let user = null;
                let detectedRole = null;

                if (role === 'admin') {
                    user = adminRows[0] || null;
                    detectedRole = 'admin';
                } else if (role === 'student') {
                    user = studentRows[0] || null;
                    detectedRole = 'student';
                } else {
                    // No role specified — pick whichever table has the email
                    if (studentRows.length > 0) { user = studentRows[0]; detectedRole = 'student'; }
                    else if (adminRows.length > 0) { user = adminRows[0]; detectedRole = 'admin'; }
                }

                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }

                // Generate JWT — embed role so verifyToken knows which table to query
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: detectedRole },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: detectedRole,
                        student_id: user.student_id || null  // null for admins
                    }
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==================== USER PROFILE ROUTES ====================

// Get profile — reads from the correct table based on JWT role
app.get('/api/user/profile', verifyToken, (req, res) => {
    const columns = req.userRole === 'admin'
        ? 'id, name, email, phone, created_at'
        : 'id, name, email, phone, student_id, created_at';

    db.query(
        `SELECT ${columns} FROM ${req.userTable} WHERE id = ?`,
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length === 0) return res.status(404).json({ message: 'User not found' });

            // Always include role in the response so the frontend knows what it's dealing with
            res.json({ user: { ...results[0], role: req.userRole } });
        }
    );
});

// Update profile — writes to the correct table
app.put('/api/user/profile', verifyToken, (req, res) => {
    const { name, phone } = req.body;

    db.query(
        `UPDATE ${req.userTable} SET name = ?, phone = ? WHERE id = ?`,
        [name, phone, req.userId],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error updating profile', error: err });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// ==================== COURSE ROUTES ====================

// Get all courses (public)
app.get('/api/courses', (req, res) => {
    db.query('SELECT * FROM courses ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ courses: results });
    });
});

// Get course by ID (public)
app.get('/api/courses/:id', (req, res) => {
    db.query('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ course: results[0] });
    });
});

// Add new course (Admin only)
app.post('/api/courses', verifyToken, requireAdmin, (req, res) => {
    const { name, type, duration, description, fee } = req.body;

    db.query(
        'INSERT INTO courses (name, type, duration, description, fee) VALUES (?, ?, ?, ?, ?)',
        [name, type, duration, description, fee],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error adding course', error: err });
            res.status(201).json({ message: 'Course added successfully', courseId: result.insertId });
        }
    );
});

// ==================== APPLICATION ROUTES ====================

// Submit course application (students only)
app.post('/api/applications', verifyToken, (req, res) => {
    const { course_id, additional_info } = req.body;

    if (!course_id) {
        return res.status(400).json({ message: 'Course ID is required' });
    }

    const applicationId = 'APP' + Date.now().toString().slice(-8);

    db.query(
        'INSERT INTO applications (user_id, course_id, application_id, additional_info, status) VALUES (?, ?, ?, ?, ?)',
        [req.userId, course_id, applicationId, additional_info || null, 'pending'],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error submitting application', error: err });
            res.status(201).json({ message: 'Application submitted successfully', applicationId });
        }
    );
});

// Get current student's own applications
app.get('/api/applications/my-applications', verifyToken, (req, res) => {
    const query = `
        SELECT a.*, c.name AS course_name, c.type AS course_type, c.duration, c.fee
        FROM applications a
        JOIN courses c ON a.course_id = c.id
        WHERE a.user_id = ?
        ORDER BY a.created_at DESC
    `;

    db.query(query, [req.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ applications: results });
    });
});

// Get ALL applications (Admin only)
// JOIN is against users table (students) — admins don't submit applications
app.get('/api/applications', verifyToken, requireAdmin, (req, res) => {
    const query = `
        SELECT 
            a.*,
            u.name       AS student_name,
            u.email      AS student_email,
            u.student_id AS student_id,
            u.phone      AS student_phone,
            u.created_at AS student_created_at,
            c.name       AS course_name,
            c.type       AS course_type
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN courses c ON a.course_id = c.id
        ORDER BY a.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ applications: results });
    });
});

// Update application status (Admin only)
app.put('/api/applications/:id/status', verifyToken, requireAdmin, (req, res) => {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected', 'review'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    db.query(
        'UPDATE applications SET status = ? WHERE id = ?',
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error updating status', error: err });
            res.json({ message: 'Application status updated successfully' });
        }
    );
});

// Delete/Cancel application (Student only — their own pending applications)
app.delete('/api/applications/:applicationId', verifyToken, (req, res) => {
    const { applicationId } = req.params;

    if (req.userRole !== 'student') {
        return res.status(403).json({ success: false, message: 'Only students can cancel their applications' });
    }

    db.query('SELECT * FROM applications WHERE application_id = ?', [applicationId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });

        const application = results[0];

        if (application.user_id !== req.userId) {
            return res.status(403).json({ success: false, message: 'You can only cancel your own applications' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel ${application.status} applications. Only pending applications can be cancelled.`
            });
        }

        db.query('DELETE FROM applications WHERE application_id = ?', [applicationId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Error cancelling application', error: err });
            res.json({ success: true, message: 'Application cancelled successfully', application_id: applicationId });
        });
    });
});

// ==================== DOCUMENT UPLOAD ROUTES ====================

app.post('/api/uploads/document', verifyToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const docType = String(req.body.docType || '').trim();
        const urlPath = `/uploads/${req.file.filename}`;

        res.status(201).json({
            message: 'Uploaded successfully',
            docType,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: `${req.protocol}://${req.get('host')}${urlPath}`,
            path: urlPath
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

// ==================== CONTACT ROUTES ====================

app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    db.query(
        'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, subject, message],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error submitting message', error: err });
            res.status(201).json({ message: 'Message sent successfully' });
        }
    );
});

// Get all contact messages (Admin only)
app.get('/api/contact', verifyToken, requireAdmin, (req, res) => {
    db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ messages: results });
    });
});

// ==================== ADMIN MANAGEMENT & STATS ====================

// Helper to generate a temporary admin password, e.g. "Admin@123456"
function generateAdminTempPassword() {
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `Admin@${randomPart}`;
}

// Create a new admin account (can only be called by an existing admin)
app.post('/api/admin/create', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check for duplicate email in BOTH admins and users
        db.query('SELECT id FROM admins WHERE email = ?', [email], (err, adminRows) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (adminRows.length > 0) {
                return res.status(400).json({ message: 'An admin already exists with this email' });
            }

            db.query('SELECT id FROM users WHERE email = ?', [email], async (err, userRows) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });
                if (userRows.length > 0) {
                    return res.status(400).json({ message: 'A student already exists with this email' });
                }

                const tempPassword = generateAdminTempPassword();
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                const insertQuery = 'INSERT INTO admins (name, email, password, phone) VALUES (?, ?, ?, ?)';
                db.query(insertQuery, [name, email, hashedPassword, phone || null], (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error creating admin', error: err });
                    }

                    // IMPORTANT: We return the temp password ONCE in the response so
                    // the creator can share it. It is stored only as a hash in DB.
                    res.status(201).json({
                        message: 'Admin created successfully',
                        admin: {
                            id: result.insertId,
                            name,
                            email,
                            phone: phone || null
                        },
                        tempPassword
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// List all admins — NEVER return passwords
app.get('/api/admin/list', verifyToken, requireAdmin, (req, res) => {
    const query = 'SELECT id, name, email, phone, created_at FROM admins ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ admins: results });
    });
});

// Delete an admin (cannot delete the last remaining admin)
app.delete('/api/admin/:id', verifyToken, requireAdmin, (req, res) => {
    const adminId = parseInt(req.params.id, 10);
    if (Number.isNaN(adminId)) {
        return res.status(400).json({ message: 'Invalid admin ID' });
    }

    // First, check how many admins exist
    db.query('SELECT COUNT(*) AS count FROM admins', (err, countRows) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        const totalAdmins = countRows[0]?.count || 0;
        if (totalAdmins <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last remaining admin' });
        }

        // Ensure the target admin exists
        db.query('SELECT id FROM admins WHERE id = ?', [adminId], (err, rows) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            db.query('DELETE FROM admins WHERE id = ?', [adminId], (err) => {
                if (err) return res.status(500).json({ message: 'Error deleting admin', error: err });
                res.json({ message: 'Admin deleted successfully' });
            });
        });
    });
});

// Allow the currently logged-in admin to change their own password
app.put('/api/admin/change-password', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        db.query('SELECT id, password FROM admins WHERE id = ?', [req.userId], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            const admin = rows[0];
            const isCurrentValid = await bcrypt.compare(currentPassword, admin.password);
            if (!isCurrentValid) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            const hashedNew = await bcrypt.hash(newPassword, 10);
            db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedNew, admin.id], (err) => {
                if (err) return res.status(500).json({ message: 'Error updating password', error: err });
                res.json({ message: 'Password updated successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Admin dashboard stats
app.get('/api/admin/stats', verifyToken, requireAdmin, (req, res) => {
    const stats = {};

    // COUNT from users table (students only now — no role filter needed)
    db.query('SELECT COUNT(*) AS count FROM users', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        stats.totalStudents = results[0].count;

        db.query('SELECT COUNT(*) AS count FROM courses', (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            stats.totalCourses = results[0].count;

            db.query('SELECT COUNT(*) AS count FROM applications', (err, results) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });
                stats.totalApplications = results[0].count;

                db.query('SELECT COUNT(*) AS count FROM applications WHERE status = "pending"', (err, results) => {
                    if (err) return res.status(500).json({ message: 'Database error', error: err });
                    stats.pendingApplications = results[0].count;

                    res.json({ stats });
                });
            });
        });
    });
});

// ==================== ERROR HANDLING ====================

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
});