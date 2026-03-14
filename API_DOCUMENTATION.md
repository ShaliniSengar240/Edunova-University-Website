# API Documentation

Complete API reference for EduNova University Backend.

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📌 Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new student account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "student"
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "studentId": "STU12345678"
}
```

**Response (Error - 400):**
```json
{
  "message": "User already exists with this email"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "student_id": "STU12345678"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Invalid credentials"
}
```

---

## 👤 User Profile Endpoints

### 3. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "student",
    "student_id": "STU12345678",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543210"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully"
}
```

---

## 📚 Course Endpoints

### 5. Get All Courses

**Endpoint:** `GET /api/courses`

**Authentication:** Not required

**Response (Success - 200):**
```json
{
  "courses": [
    {
      "id": 1,
      "name": "Computer Science Engineering",
      "type": "Bachelor",
      "duration": "4 Years",
      "description": "Comprehensive program covering software development...",
      "fee": 50000.00,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Get Course by ID

**Endpoint:** `GET /api/courses/:id`

**Authentication:** Not required

**Example:** `GET /api/courses/1`

**Response (Success - 200):**
```json
{
  "course": {
    "id": 1,
    "name": "Computer Science Engineering",
    "type": "Bachelor",
    "duration": "4 Years",
    "description": "Comprehensive program...",
    "fee": 50000.00,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "message": "Course not found"
}
```

---

### 7. Add New Course (Admin Only)

**Endpoint:** `POST /api/courses`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Request Body:**
```json
{
  "name": "Data Science",
  "type": "Master",
  "duration": "2 Years",
  "description": "Advanced program in data analytics...",
  "fee": 60000.00
}
```

**Response (Success - 201):**
```json
{
  "message": "Course added successfully",
  "courseId": 11
}
```

**Response (Error - 403):**
```json
{
  "message": "Access denied. Admin only."
}
```

---

## 📝 Application Endpoints

### 8. Submit Course Application

**Endpoint:** `POST /api/applications`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "course_id": 1,
  "additional_info": "I am very interested in this course..."
}
```

**Response (Success - 201):**
```json
{
  "message": "Application submitted successfully",
  "applicationId": "APP12345678"
}
```

**Response (Error - 400):**
```json
{
  "message": "Course ID is required"
}
```

---

### 9. Get My Applications

**Endpoint:** `GET /api/applications/my-applications`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "applications": [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "application_id": "APP12345678",
      "status": "pending",
      "additional_info": "I am very interested...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "course_name": "Computer Science Engineering",
      "course_type": "Bachelor",
      "duration": "4 Years",
      "fee": 50000.00
    }
  ]
}
```

---

### 10. Get All Applications (Admin Only)

**Endpoint:** `GET /api/applications`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "applications": [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "application_id": "APP12345678",
      "status": "pending",
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "student_id": "STU12345678",
      "course_name": "Computer Science Engineering",
      "course_type": "Bachelor",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 11. Update Application Status (Admin Only)

**Endpoint:** `PUT /api/applications/:id/status`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Example:** `PUT /api/applications/1/status`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:**
- `pending`
- `approved`
- `rejected`
- `review`

**Response (Success - 200):**
```json
{
  "message": "Application status updated successfully"
}
```

**Response (Error - 400):**
```json
{
  "message": "Invalid status"
}
```

---

## 📧 Contact Endpoints

### 12. Submit Contact Form

**Endpoint:** `POST /api/contact`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "admissions",
  "message": "I would like to know more about..."
}
```

**Response (Success - 201):**
```json
{
  "message": "Message sent successfully"
}
```

---

### 13. Get All Contact Messages (Admin Only)

**Endpoint:** `GET /api/contact`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "messages": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "subject": "admissions",
      "message": "I would like to know more...",
      "status": "new",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📊 Admin Dashboard Endpoints

### 14. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/stats`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
```

**Response (Success - 200):**
```json
{
  "stats": {
    "totalStudents": 150,
    "totalCourses": 10,
    "totalApplications": 45,
    "pendingApplications": 12
  }
}
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "message": "Route not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Database error",
  "error": "Error details here"
}
```

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Get Courses
```bash
curl http://localhost:5000/api/courses
```

### Get Profile (with token)
```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Notes

1. All timestamps are in UTC format
2. JWT tokens expire after 24 hours
3. Admin endpoints require admin role in JWT token
4. File uploads are not yet implemented
5. Pagination is not yet implemented for list endpoints

---

**Last Updated:** January 2024
