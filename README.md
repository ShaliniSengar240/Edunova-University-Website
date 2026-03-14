# EduNova University - Backend API

Node.js + Express + MySQL backend server for EduNova University website.

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL Server** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
- **MySQL Workbench** (optional but recommended) - [Download](https://dev.mysql.com/downloads/workbench/)

## 🚀 Installation Steps

### Step 1: Install Node.js Dependencies

Open a terminal/command prompt in the `backend` folder and run:

```bash
npm install
```

This will install all required packages:
- express (web framework)
- mysql2 (MySQL driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (cross-origin requests)
- body-parser (request body parsing)
- dotenv (environment variables)

### Step 2: Configure Environment Variables

1. Open the `.env` file in the backend folder
2. Update the database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=edunova_university
JWT_SECRET=your-super-secret-key-change-this
```

**Important:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password.

### Step 3: Setup MySQL Database

You have **two options** to setup the database:

#### Option A: Using Node.js Script (Recommended)

Run this command in the backend folder:

```bash
npm run init-db
```

This will:
- Create the database
- Create all tables
- Insert sample courses
- Create default admin and student accounts

#### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the file: `database/schema.sql`
4. Click "Execute" (⚡ icon) to run the script

### Step 4: Start the Server

#### For Development (with auto-restart):
```bash
npm run dev
```

#### For Production:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── database/
│   ├── schema.sql           # Database schema and sample data
│   └── init-database.js     # Database initialization script
├── node_modules/            # Dependencies (auto-generated)
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example            # Environment template
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
└── server.js               # Main server file
```

## 🔑 Default Login Credentials

After database initialization, you can use these credentials:

### Admin Account
- **Email:** admin@edunova.edu
- **Password:** admin123
- **Role:** admin

### Student Account
- **Email:** john.doe@example.com
- **Password:** student123
- **Role:** student

⚠️ **Important:** Change these passwords after first login!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Add new course (admin only)

### Applications
- `POST /api/applications` - Submit course application (requires auth)
- `GET /api/applications/my-applications` - Get user's applications (requires auth)
- `GET /api/applications` - Get all applications (admin only)
- `PUT /api/applications/:id/status` - Update application status (admin only)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (admin only)

### Admin Dashboard
- `GET /api/admin/stats` - Get dashboard statistics (admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login, include the token in requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🗄️ Database Schema

### Tables:
1. **users** - Store user information (students and admin)
2. **courses** - Store course information
3. **applications** - Store course applications
4. **contact_messages** - Store contact form submissions

## 🧪 Testing the API

### Using Browser
Visit: `http://localhost:5000/`

You should see: `{"message": "EduNova University API Server is running!"}`

### Using Postman or Thunder Client

#### 1. Register a New User:
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test Student",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### 2. Login:
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 3. Get All Courses:
```
GET http://localhost:5000/api/courses
```

## 🔧 Troubleshooting

### Error: "Cannot connect to MySQL"
- Check if MySQL server is running
- Verify credentials in `.env` file
- Ensure MySQL is running on port 3306 (default)

### Error: "Database does not exist"
- Run `npm run init-db` to create the database
- Or manually run `database/schema.sql` in MySQL Workbench

### Error: "Port 5000 already in use"
- Change the PORT in `.env` file to another port (e.g., 5001)
- Or stop the application using port 5000

### Error: "Module not found"
- Delete `node_modules` folder
- Run `npm install` again

## 📝 Development Tips

### Enable Debug Mode
Add this to `.env`:
```
NODE_ENV=development
```

### View Database in MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost
3. Select `edunova_university` database
4. Browse tables to see data

### Add More Sample Data
Edit `database/schema.sql` and add more INSERT statements, then run:
```bash
npm run init-db
```

## 🔄 Updating Dependencies

To update all packages:
```bash
npm update
```

To check for outdated packages:
```bash
npm outdated
```

## 🛡️ Security Notes

1. **Never commit `.env` file** - It contains sensitive information
2. **Change default passwords** immediately after setup
3. **Use strong JWT_SECRET** in production
4. **Enable HTTPS** in production
5. **Implement rate limiting** for API endpoints

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure MySQL server is running
4. Check that port 5000 is available

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 🚀**
