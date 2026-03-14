// API.js - Frontend API Integration for EduNova University
// Place this file in your frontend/js/ folder

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:3000/api';

// ==================== TOKEN MANAGEMENT ====================

// Get JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Save JWT token to localStorage
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Remove token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Save user to localStorage
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// ==================== API CALL HELPER ====================

async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add authorization header if required or token exists
    if (requiresAuth || getToken()) {
        const token = getToken();
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        } else if (requiresAuth) {
            throw new Error('Authentication required. Please log in.');
        }
    }

    // Add body for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            // Handle specific error cases
            if (response.status === 401) {
                removeToken();
                localStorage.removeItem('user');
                throw new Error('Session expired. Please log in again.');
            }
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Register new user
async function register(name, email, password, phone = null, role = 'student') {
    try {
        const result = await apiCall('/auth/register', 'POST', {
            name,
            email,
            password,
            phone,
            role
        });
        return result;
    } catch (error) {
        throw error;
    }
}

// Login user
async function login(email, password, role = null) {
    try {
        const result = await apiCall('/auth/login', 'POST', {
            email,
            password,
            role
        });
        
        if (result.token && result.user) {
            saveToken(result.token);
            saveUser(result.user);
        }
        
        return result;
    } catch (error) {
        throw error;
    }
}

// Logout user
function logout() {
    removeToken();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ==================== USER PROFILE FUNCTIONS ====================

// Get user profile
async function getUserProfile() {
    try {
        return await apiCall('/user/profile', 'GET', null, true);
    } catch (error) {
        throw error;
    }
}

// Update user profile
async function updateUserProfile(name, phone) {
    try {
        return await apiCall('/user/profile', 'PUT', { name, phone }, true);
    } catch (error) {
        throw error;
    }
}

// ==================== COURSE FUNCTIONS ====================

// Get all courses
async function getAllCourses() {
    try {
        return await apiCall('/courses');
    } catch (error) {
        throw error;
    }
}

// Get course by ID
async function getCourseById(courseId) {
    try {
        return await apiCall(`/courses/${courseId}`);
    } catch (error) {
        throw error;
    }
}

// Add new course (Admin only)
async function addCourse(name, type, duration, description, fee) {
    try {
        return await apiCall('/courses', 'POST', {
            name,
            type,
            duration,
            description,
            fee
        }, true);
    } catch (error) {
        throw error;
    }
}

// ==================== APPLICATION FUNCTIONS ====================

// Submit course application
async function submitApplication(courseId, additionalInfo = null) {
    try {
        return await apiCall('/applications', 'POST', {
            course_id: courseId,
            additional_info: additionalInfo
        }, true);
    } catch (error) {
        throw error;
    }
}

// Get my applications
async function getMyApplications() {
    try {
        return await apiCall('/applications/my-applications', 'GET', null, true);
    } catch (error) {
        throw error;
    }
}

// Get all applications (Admin only)
async function getAllApplications() {
    try {
        return await apiCall('/applications', 'GET', null, true);
    } catch (error) {
        throw error;
    }
}

// Update application status (Admin only)
async function updateApplicationStatus(applicationId, status) {
    try {
        return await apiCall(`/applications/${applicationId}/status`, 'PUT', {
            status
        }, true);
    } catch (error) {
        throw error;
    }
}

// ==================== CONTACT FUNCTIONS ====================

// Submit contact form
async function submitContactForm(name, email, phone, subject, message) {
    try {
        return await apiCall('/contact', 'POST', {
            name,
            email,
            phone,
            subject,
            message
        });
    } catch (error) {
        throw error;
    }
}

// Get all contact messages (Admin only)
async function getAllContactMessages() {
    try {
        return await apiCall('/contact', 'GET', null, true);
    } catch (error) {
        throw error;
    }
}

// ==================== ADMIN FUNCTIONS ====================

// Get dashboard statistics
async function getAdminStats() {
    try {
        return await apiCall('/admin/stats', 'GET', null, true);
    } catch (error) {
        throw error;
    }
}

// ==================== UI HELPER FUNCTIONS ====================

// Show loading spinner
function showLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

// Hide loading spinner
function hideLoading(elementId = 'loading') {
    const loadingElement = document.getElementById(elementId);
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Show error message
function showError(message, elementId = 'error-message') {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert('Error: ' + message);
    }
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

// Redirect if not logged in
function requireLogin(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Redirect if not admin
function requireAdmin(redirectUrl = 'login.html') {
    if (!isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// ==================== ADMIN MANAGEMENT FUNCTIONS ====================

// Create a new admin account (must be called by a logged-in admin)
async function createAdmin(name, email, phone = null) {
    return await apiCall('/admin/create', 'POST', { name, email, phone }, true);
}

// List all admins — passwords are never returned
async function listAdmins() {
    return await apiCall('/admin/list', 'GET', null, true);
}

// Change the currently logged-in admin's own password
async function changeAdminPassword(currentPassword, newPassword) {
    return await apiCall('/admin/change-password', 'PUT', { currentPassword, newPassword }, true);
}

// ==================== INITIALIZATION ====================

// Check auth status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Display user info if logged in
    const user = getCurrentUser();
    if (user) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.name;
        });
        
        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });
    }
    
    // Add logout handler to logout buttons
    const logoutButtons = document.querySelectorAll('.logout-btn, a[href*="logout"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    });
});

// Export functions for use in other scripts
window.API = {
    // Config
    API_BASE_URL,
    
    // Auth
    register,
    login,
    logout,
    isLoggedIn,
    isAdmin,
    
    // Token management
    getToken,
    saveToken,
    removeToken,
    
    // User
    getCurrentUser,
    saveUser,
    getUserProfile,
    updateUserProfile,
    
    // Courses
    getAllCourses,
    getCourseById,
    addCourse,
    
    // Applications
    submitApplication,
    getMyApplications,
    getAllApplications,
    updateApplicationStatus,
    
    // Contact
    submitContactForm,
    getAllContactMessages,
    
    // Admin
    getAdminStats,
    createAdmin,
    listAdmins,
    changeAdminPassword,
    
    // Helpers
    showLoading,
    hideLoading,
    showError,
    showSuccess,
    requireLogin,
    requireAdmin,
    formatDate,
    formatCurrency
};