# Complete Setup Guide for EduNova University

## 📦 Project Structure

Your project should be organized like this:

```
project-root/
├── frontend/
│   ├── home.html
│   ├── about.html
│   ├── courses.html
│   ├── contact.html
│   ├── login.html
│   ├── dashboard.html
│   ├── admin.html
│   ├── stylee.css
│   ├── about.css
│   ├── courses.css
│   ├── contact.css
│   ├── login.css
│   ├── dashboard.css
│   ├── admin.css
│   └── (other assets like images, js files)
│
└── backend/
    ├── database/
    │   ├── schema.sql
    │   └── init-database.js
    ├── node_modules/ (created after npm install)
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json (created after npm install)
    ├── server.js
    ├── README.md
    ├── API_DOCUMENTATION.md
    └── SETUP_GUIDE.md (this file)
```

---

## 🚀 Step-by-Step Setup Instructions

### STEP 1: Verify Prerequisites

Before starting, make sure you have:

#### 1.1 Check Node.js Installation
Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
node --version
```
You should see something like: `v18.17.0` or higher

If not installed, download from: https://nodejs.org/

#### 1.2 Check MySQL Installation
```bash
mysql --version
```
You should see: `mysql Ver 8.0.x` or higher

If not installed, download from: https://dev.mysql.com/downloads/mysql/

#### 1.3 Verify MySQL is Running

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Look for "MySQL80" (or similar)
- Status should be "Running"

**Mac/Linux:**
```bash
sudo systemctl status mysql
```

---

### STEP 2: Setup Backend

#### 2.1 Navigate to Backend Folder

Open Command Prompt/Terminal and navigate to your backend folder:

**Windows:**
```bash
cd C:\path\to\project-root\backend
```

**Mac/Linux:**
```bash
cd /path/to/project-root/backend
```

#### 2.2 Install Dependencies

Run this command:
```bash
npm install
```

Wait for all packages to download and install. You should see:
- `node_modules` folder created
- `package-lock.json` file created

**Expected Output:**
```
added 57 packages, and audited 58 packages in 3s
found 0 vulnerabilities
```

---

### STEP 3: Configure Environment Variables

#### 3.1 Find Your MySQL Password

You set this password during MySQL installation. If you forgot:

**Windows:**
1. Open MySQL Workbench
2. Try connecting with different passwords
3. Common defaults: (empty), "root", "password", "admin"

**Mac/Linux:**
```bash
sudo cat /etc/mysql/debian.cnf
```

#### 3.2 Edit .env File

Open `.env` file in a text editor (Notepad, VS Code, etc.) and update:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_ACTUAL_MYSQL_PASSWORD
DB_NAME=edunova_university
JWT_SECRET=change-this-to-a-random-long-string-123456789
```

**Important:** Replace `YOUR_ACTUAL_MYSQL_PASSWORD` with your real MySQL password!

**Example:**
```env
DB_PASSWORD=mypassword123
```

#### 3.3 Save the File

Make sure to save the `.env` file after editing.

---

### STEP 4: Create Database

You have two options:

#### Option A: Automatic (Recommended)

In the backend folder, run:
```bash
npm run init-db
```

**Expected Output:**
```
Connected to MySQL server
Creating database and tables...
✓ Database created successfully
✓ Tables created successfully
✓ Sample data inserted

Default credentials:
  Admin - Email: admin@edunova.edu, Password: admin123
  Student - Email: john.doe@example.com, Password: student123

Database initialization completed!
```

If you see errors, check:
- MySQL is running
- Password in `.env` is correct
- MySQL user has permissions

#### Option B: Manual (Using MySQL Workbench)

1. **Open MySQL Workbench**
2. **Connect to MySQL Server**
   - Click on your connection (usually "Local instance MySQL80")
   - Enter your password
3. **Open SQL File**
   - Click File → Open SQL Script
   - Navigate to `backend/database/schema.sql`
   - Click Open
4. **Execute Script**
   - Click the lightning bolt icon (⚡) or press Ctrl+Shift+Enter
   - Wait for completion
5. **Verify**
   - In the left sidebar, click the refresh icon
   - You should see `edunova_university` database
   - Expand it to see tables: users, courses, applications, contact_messages

---

### STEP 5: Start the Backend Server

#### 5.1 For Development (with auto-restart)

In the backend folder, run:
```bash
npm run dev
```

**Expected Output:**
```
[nodemon] 3.0.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Connected to MySQL database successfully!
Server is running on port 5000
API URL: http://localhost:5000
```

#### 5.2 For Production

```bash
npm start
```

**Note:** With `npm start`, you need to manually restart after code changes. With `npm run dev`, the server auto-restarts.

---

### STEP 6: Test the Backend

#### 6.1 Test in Browser

Open your web browser and go to:
```
http://localhost:5000
```

You should see:
```json
{"message":"EduNova University API Server is running!"}
```

#### 6.2 Test API Endpoints

**Get All Courses:**
```
http://localhost:5000/api/courses
```

You should see JSON data with all courses.

---

### STEP 7: Connect Frontend to Backend

Now you need to update your frontend HTML files to make API calls to the backend.

#### 7.1 Create JavaScript File for API Calls

Create a new file: `frontend/js/api.js`

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Save token to localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// API call helper function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add authorization header if token exists
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function register(name, email, password, phone) {
    return await apiCall('/auth/register', 'POST', {
        name, email, password, phone
    });
}

async function login(email, password, role) {
    const result = await apiCall('/auth/login', 'POST', {
        email, password, role
    });
    
    if (result.token) {
        saveToken(result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
}

function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Course Functions
async function getAllCourses() {
    return await apiCall('/courses');
}

async function getCourseById(id) {
    return await apiCall(`/courses/${id}`);
}

// Application Functions
async function submitApplication(courseId, additionalInfo) {
    return await apiCall('/applications', 'POST', {
        course_id: courseId,
        additional_info: additionalInfo
    });
}

async function getMyApplications() {
    return await apiCall('/applications/my-applications');
}

// Contact Functions
async function submitContactForm(name, email, phone, subject, message) {
    return await apiCall('/contact', 'POST', {
        name, email, phone, subject, message
    });
}

// Profile Functions
async function getUserProfile() {
    return await apiCall('/user/profile');
}

async function updateUserProfile(name, phone) {
    return await apiCall('/user/profile', 'PUT', { name, phone });
}

// Admin Functions
async function getAdminStats() {
    return await apiCall('/admin/stats');
}

async function getAllApplications() {
    return await apiCall('/applications');
}

async function updateApplicationStatus(id, status) {
    return await apiCall(`/applications/${id}/status`, 'PUT', { status });
}
```

#### 7.2 Update Login Page

Add this script to `login.html` before the closing `</body>` tag:

```html
<!-- Add this before other scripts -->
<script src="js/api.js"></script>

<script>
// Handle login form submission
document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('.role-tab.active').textContent.toLowerCase().includes('admin') ? 'admin' : 'student';
    
    try {
        const result = await login(email, password, role);
        alert('Login successful!');
        
        // Redirect based on role
        if (result.user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});
</script>
```

#### 7.3 Update Contact Page

Add this script to `contact.html`:

```html
<script src="js/api.js"></script>

// Handle contact form submission
document.querySelector('.contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    <script>

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    try {
        await submitContactForm(name, email, phone, subject, message);
        alert('Message sent successfully!');
        e.target.reset();
    } catch (error) {
        alert('Failed to send message: ' + error.message);
    }
});
</script>
```

---

### STEP 8: Test Complete Integration

#### 8.1 Test Login

1. Open `frontend/login.html` in your browser
2. Try logging in with:
   - Email: `admin@edunova.edu`
   - Password: `admin123`
3. You should be redirected to the admin dashboard

#### 8.2 Test Contact Form

1. Go to `contact.html`
2. Fill out the form
3. Submit and check for success message

#### 8.3 View Database

Open MySQL Workbench:
1. Select `edunova_university` database
2. Right-click on `contact_messages` table
3. Select "Select Rows - Limit 1000"
4. You should see your contact form submission

---

## 🔧 Common Issues and Solutions

### Issue 1: "Cannot connect to MySQL"

**Solution:**
1. Check if MySQL is running
2. Verify password in `.env` file
3. Try connecting with MySQL Workbench first

### Issue 2: "Port 5000 already in use"

**Solution:**
Change port in `.env`:
```env
PORT=5001
```

Then update frontend API URL to `http://localhost:5001/api`

### Issue 3: "Module not found"

**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue 4: "CORS Error" in browser

**Solution:**
The server already has CORS enabled. If you still see errors:
1. Make sure backend is running
2. Check API URL in frontend matches backend URL
3. Open browser in incognito mode to clear cache

### Issue 5: "Token expired"

**Solution:**
Log out and log in again. Tokens expire after 24 hours.

### Issue 6: Database connection timeout

**Solution:**
Check MySQL max connections:
```sql
SHOW VARIABLES LIKE 'max_connections';
SET GLOBAL max_connections = 200;
```

---

## 🎯 Next Steps

After successful setup:

1. **Change Default Passwords**
   - Log in as admin
   - Change the default admin password
   - Create new admin accounts if needed

2. **Add More Courses**
   - Log in as admin
   - Use the admin panel to add courses
   - Or insert directly via MySQL Workbench

3. **Customize Frontend**
   - Update colors, logos, content
   - Add more features as needed

4. **Deploy to Production**
   - Consider using services like Heroku, AWS, or DigitalOcean
   - Use environment-specific `.env` files
   - Enable HTTPS
   - Set up proper logging

---

## 📞 Getting Help

If you're stuck:

1. **Check the console** for error messages
2. **Read error messages carefully** - they usually tell you what's wrong
3. **Check all files exist** in the correct locations
4. **Verify all steps** were completed in order
5. **Try restarting** MySQL and the Node.js server

---

**Setup completed successfully? Great! Happy coding! 🚀**
