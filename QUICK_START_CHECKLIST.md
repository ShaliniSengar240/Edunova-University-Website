# 🚀 Quick Start Checklist

Use this checklist to quickly set up your EduNova University project.

## ✅ Prerequisites Check

- [ ] Node.js installed (check: `node --version`)
- [ ] MySQL installed (check: `mysql --version`)
- [ ] MySQL server is running
- [ ] You know your MySQL root password

## ✅ Backend Setup

### 1. Install Dependencies
```bash
cd project-root/backend
npm install
```
- [ ] `node_modules` folder created
- [ ] No error messages

### 2. Configure Environment
- [ ] Open `.env` file
- [ ] Update `DB_PASSWORD` with your MySQL password
- [ ] Save the file

### 3. Create Database
```bash
npm run init-db
```
- [ ] Database created successfully
- [ ] Tables created successfully
- [ ] Sample data inserted
- [ ] Default credentials displayed

### 4. Start Server
```bash
npm run dev
```
- [ ] Server running on port 5000
- [ ] "Connected to MySQL database" message shown
- [ ] No error messages

### 5. Test Backend
Open browser and visit: `http://localhost:5000`
- [ ] See message: "EduNova University API Server is running!"

Visit: `http://localhost:5000/api/courses`
- [ ] See JSON data with courses

## ✅ Frontend Setup

### 1. Copy Files
- [ ] Copy `api.js` to `frontend/js/api.js`
- [ ] Create `frontend/js/` folder if it doesn't exist

### 2. Update HTML Files

#### login.html
- [ ] Add `<script src="js/api.js"></script>` before `</body>`
- [ ] Add login handler script (see INTEGRATION_GUIDE.md)

#### contact.html
- [ ] Add `<script src="js/api.js"></script>` before `</body>`
- [ ] Add contact form handler script

#### courses.html
- [ ] Add `<script src="js/api.js"></script>` before `</body>`
- [ ] Add courses loading script
- [ ] Add container IDs: `bachelor-courses-grid` and `master-courses-grid`

#### dashboard.html
- [ ] Add `<script src="js/api.js"></script>` before `</body>`
- [ ] Add dashboard loading script

#### admin.html
- [ ] Add `<script src="js/api.js"></script>` before `</body>`
- [ ] Add admin dashboard script

### 3. Add UI Elements
Add to all pages (near top of `<body>`):
- [ ] Loading spinner div
- [ ] Success message div
- [ ] Error message div

(Copy from INTEGRATION_GUIDE.md)

## ✅ Testing

### Test 1: Login
- [ ] Open `login.html` in browser
- [ ] Try logging in with: admin@edunova.edu / admin123
- [ ] Successfully redirected to admin.html
- [ ] Try logging in with: john.doe@example.com / student123
- [ ] Successfully redirected to dashboard.html

### Test 2: Contact Form
- [ ] Open `contact.html`
- [ ] Fill out form
- [ ] Submit successfully
- [ ] See success message

### Test 3: Courses
- [ ] Open `courses.html`
- [ ] See courses loaded from database
- [ ] Click "Apply Now" button
- [ ] Redirected to login if not logged in

### Test 4: Student Dashboard
- [ ] Login as student
- [ ] Dashboard loads successfully
- [ ] See applications (if any)
- [ ] See statistics

### Test 5: Admin Dashboard
- [ ] Login as admin
- [ ] Admin panel loads successfully
- [ ] See all applications
- [ ] See statistics
- [ ] Try approving an application
- [ ] Try rejecting an application

## ✅ Database Verification

### Using MySQL Workbench
- [ ] Open MySQL Workbench
- [ ] Connect to localhost
- [ ] See `edunova_university` database
- [ ] See tables: users, courses, applications, contact_messages
- [ ] Browse `users` table - see admin and student
- [ ] Browse `courses` table - see 10 courses
- [ ] Browse `applications` table - see submitted applications
- [ ] Browse `contact_messages` table - see submitted messages

## ✅ Default Credentials

### Admin Account
```
Email: admin@edunova.edu
Password: admin123
Role: admin
```

### Student Account
```
Email: john.doe@example.com
Password: student123
Role: student
```

⚠️ **Remember to change these passwords after first login!**

## ✅ Common Commands

### Backend
```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server (auto-restart)
npm run dev

# Start production server
npm start
```

### Testing
```bash
# Test if server is running
curl http://localhost:5000

# Get all courses
curl http://localhost:5000/api/courses

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edunova.edu","password":"admin123"}'
```

## ✅ File Structure

```
project-root/
├── frontend/
│   ├── js/
│   │   └── api.js ✓
│   ├── home.html ✓
│   ├── about.html ✓
│   ├── courses.html ✓ (updated)
│   ├── contact.html ✓ (updated)
│   ├── login.html ✓ (updated)
│   ├── dashboard.html ✓ (updated)
│   ├── admin.html ✓ (updated)
│   └── (CSS files) ✓
│
└── backend/
    ├── database/
    │   ├── schema.sql ✓
    │   └── init-database.js ✓
    ├── node_modules/ ✓
    ├── .env ✓ (configured)
    ├── .env.example ✓
    ├── .gitignore ✓
    ├── package.json ✓
    ├── package-lock.json ✓
    └── server.js ✓
```

## ✅ Troubleshooting

### Backend won't start
- [ ] MySQL is running
- [ ] Password in `.env` is correct
- [ ] Port 5000 is not in use
- [ ] `node_modules` folder exists

### Database error
- [ ] Database exists (run `npm run init-db`)
- [ ] MySQL user has permissions
- [ ] Connection details in `.env` are correct

### Frontend not loading data
- [ ] Backend server is running
- [ ] `api.js` file is in correct location
- [ ] Browser console shows no errors
- [ ] Check API_BASE_URL in api.js matches backend URL

### CORS errors
- [ ] Backend server is running
- [ ] Using correct API URL
- [ ] Clear browser cache and try again

## 📝 Next Steps After Setup

1. [ ] Change default admin password
2. [ ] Create new admin accounts if needed
3. [ ] Add more courses via admin panel
4. [ ] Test all features thoroughly
5. [ ] Customize frontend design
6. [ ] Add more features as needed
7. [ ] Consider deploying to production

## 🎉 Setup Complete!

If all items are checked, your project is ready to use!

### Quick Access URLs
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/courses
- Frontend: Open `frontend/home.html` in browser

### Support Resources
- README.md - Detailed documentation
- API_DOCUMENTATION.md - Complete API reference
- SETUP_GUIDE.md - Step-by-step setup instructions
- INTEGRATION_GUIDE.md - Frontend integration examples

---

**Happy Coding! 🚀**

Need help? Check the documentation files or review error messages in the console.
