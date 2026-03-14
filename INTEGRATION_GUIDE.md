# Frontend Integration Examples

## How to Integrate Backend API with Your Frontend

### Step 1: Add API.js to Your Frontend

1. Create a folder: `frontend/js/`
2. Copy `api.js` file into this folder
3. Add this script tag to ALL your HTML pages (before closing `</body>` tag):

```html
<script src="js/api.js"></script>
```

---

## Login Page Integration (login.html)

Add this script after including `api.js`:

```html
<script src="js/api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (API.isLoggedIn()) {
        const user = API.getCurrentUser();
        window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
        return;
    }

    // Handle login form submission
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Get selected role
            const activeRoleTab = document.querySelector('.role-tab.active');
            const role = activeRoleTab.textContent.toLowerCase().includes('admin') ? 'admin' : 'student';
            
            try {
                API.showLoading();
                const result = await API.login(email, password, role);
                API.hideLoading();
                
                API.showSuccess('Login successful! Redirecting...');
                
                setTimeout(() => {
                    if (result.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
                
            } catch (error) {
                API.hideLoading();
                API.showError(error.message);
            }
        });
    }
});
</script>
```

---

## Contact Page Integration (contact.html)

Add this script:

```html
<script src="js/api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            try {
                API.showLoading();
                await API.submitContactForm(name, email, phone, subject, message);
                API.hideLoading();
                
                API.showSuccess('Message sent successfully! We will get back to you soon.');
                contactForm.reset();
                
            } catch (error) {
                API.hideLoading();
                API.showError(error.message);
            }
        });
    }
});
</script>
```

---

## Courses Page Integration (courses.html)

Add this script to dynamically load courses:

```html
<script src="js/api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
    try {
        API.showLoading();
        const result = await API.getAllCourses();
        API.hideLoading();
        
        const courses = result.courses;
        
        // Separate bachelor and master courses
        const bachelorCourses = courses.filter(c => c.type === 'Bachelor');
        const masterCourses = courses.filter(c => c.type === 'Master');
        
        // Display bachelor courses
        displayCourses(bachelorCourses, 'bachelor-courses-grid');
        
        // Display master courses
        displayCourses(masterCourses, 'master-courses-grid');
        
    } catch (error) {
        API.hideLoading();
        console.error('Error loading courses:', error);
    }
});

function displayCourses(courses, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
    }
    
    container.innerHTML = '';
    
    courses.forEach(course => {
        const courseCard = `
            <div class="program-card">
                <div class="program-icon">
                    <i class="fa fa-graduation-cap"></i>
                </div>
                <h3>${course.name}</h3>
                <div class="duration">
                    <i class="fa fa-clock-o"></i> ${course.duration}
                </div>
                <p class="description">${course.description}</p>
                <p class="fee"><strong>Fee:</strong> ${API.formatCurrency(course.fee)}</p>
                <button class="apply-btn" onclick="applyCourse(${course.id})">
                    <i class="fa fa-paper-plane"></i> Apply Now
                </button>
            </div>
        `;
        
        container.innerHTML += courseCard;
    });
}

function applyCourse(courseId) {
    if (!API.isLoggedIn()) {
        alert('Please login to apply for courses');
        window.location.href = 'login.html';
        return;
    }
    
    // Redirect to application page with course ID
    window.location.href = `dashboard.html?apply=${courseId}`;
}
</script>
```

**Note:** You need to add these IDs to your courses.html:
- `bachelor-courses-grid` for the bachelor courses container
- `master-courses-grid` for the master courses container

---

## Student Dashboard Integration (dashboard.html)

Add this script:

```html
<script src="js/api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    if (!API.requireLogin()) {
        return;
    }
    
    const user = API.getCurrentUser();
    
    // Display user info
    document.querySelector('.user-profile h3').textContent = user.name;
    document.querySelector('.user-id').textContent = `ID: ${user.student_id}`;
    
    // Load applications
    try {
        API.showLoading();
        const result = await API.getMyApplications();
        API.hideLoading();
        
        displayApplications(result.applications);
        updateStats(result.applications);
        
    } catch (error) {
        API.hideLoading();
        API.showError(error.message);
    }
});

function displayApplications(applications) {
    const container = document.querySelector('.applications-list');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = '<p>No applications yet. Apply for a course to get started!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    applications.forEach(app => {
        const statusClass = app.status.toLowerCase();
        const statusIcon = getStatusIcon(app.status);
        
        const appCard = `
            <div class="application-card ${statusClass}">
                <div class="application-header">
                    <div class="application-icon">
                        <i class="fa fa-graduation-cap"></i>
                    </div>
                    <div class="application-title">
                        <h3>${app.course_name}</h3>
                        <p class="program-type">${app.course_type} Program</p>
                    </div>
                    <span class="status-badge ${statusClass}">
                        <i class="fa ${statusIcon}"></i> ${app.status.toUpperCase()}
                    </span>
                </div>
                <div class="application-details">
                    <div class="detail-item">
                        <i class="fa fa-calendar"></i>
                        <span>Applied: ${API.formatDate(app.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa fa-clock-o"></i>
                        <span>Duration: ${app.duration}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fa fa-money"></i>
                        <span>Fee: ${API.formatCurrency(app.fee)}</span>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += appCard;
    });
}

function updateStats(applications) {
    const total = applications.length;
    const pending = applications.filter(a => a.status === 'pending').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const review = applications.filter(a => a.status === 'review').length;
    
    // Update stat cards
    const statCards = {
        'pending': pending,
        'approved': approved,
        'review': review,
        'total': total
    };
    
    Object.keys(statCards).forEach(key => {
        const element = document.querySelector(`.stat-card.${key} h3`);
        if (element) {
            element.textContent = statCards[key];
        }
    });
}

function getStatusIcon(status) {
    const icons = {
        'pending': 'fa-clock-o',
        'approved': 'fa-check-circle',
        'rejected': 'fa-times-circle',
        'review': 'fa-eye'
    };
    return icons[status.toLowerCase()] || 'fa-circle';
}
</script>
```

---

## Admin Dashboard Integration (admin.html)

Add this script:

```html
<script src="js/api.js"></script>
<script>
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is admin
    if (!API.requireAdmin()) {
        return;
    }
    
    const user = API.getCurrentUser();
    
    // Display admin info
    document.querySelector('.admin-profile h3').textContent = user.name;
    document.querySelector('.admin-role').textContent = 'Administrator';
    
    // Load dashboard data
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        API.showLoading();
        
        // Load statistics
        const statsResult = await API.getAdminStats();
        updateAdminStats(statsResult.stats);
        
        // Load applications
        const appsResult = await API.getAllApplications();
        displayAdminApplications(appsResult.applications);
        
        API.hideLoading();
        
    } catch (error) {
        API.hideLoading();
        API.showError(error.message);
    }
}

function updateAdminStats(stats) {
    // Update stat cards
    const statMapping = {
        'totalStudents': '.blue .stat-info h2',
        'totalCourses': '.green .stat-info h2',
        'totalApplications': '.orange .stat-info h2',
        'pendingApplications': '.purple .stat-info h2'
    };
    
    Object.keys(statMapping).forEach(key => {
        const element = document.querySelector(statMapping[key]);
        if (element && stats[key] !== undefined) {
            element.textContent = stats[key];
        }
    });
}

function displayAdminApplications(applications) {
    const tbody = document.querySelector('.admin-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Show only recent 10 applications
    const recentApps = applications.slice(0, 10);
    
    recentApps.forEach(app => {
        const row = `
            <tr>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">${app.student_name.charAt(0)}</div>
                        <div>
                            <strong>${app.student_name}</strong>
                            <small>${app.student_email}</small>
                        </div>
                    </div>
                </td>
                <td>${app.course_name}</td>
                <td>${API.formatDate(app.created_at)}</td>
                <td>
                    <span class="status-pill ${app.status}">${app.status.toUpperCase()}</span>
                </td>
                <td>
                    <button class="action-icon approve" onclick="updateStatus(${app.id}, 'approved')" title="Approve">
                        <i class="fa fa-check"></i>
                    </button>
                    <button class="action-icon view" onclick="viewApplication(${app.id})" title="View Details">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="action-icon reject" onclick="updateStatus(${app.id}, 'rejected')" title="Reject">
                        <i class="fa fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
        
        tbody.innerHTML += row;
    });
}

async function updateStatus(applicationId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this application?`)) {
        return;
    }
    
    try {
        API.showLoading();
        await API.updateApplicationStatus(applicationId, newStatus);
        API.hideLoading();
        
        API.showSuccess(`Application ${newStatus} successfully!`);
        
        // Reload data
        setTimeout(() => {
            loadDashboardData();
        }, 1000);
        
    } catch (error) {
        API.hideLoading();
        API.showError(error.message);
    }
}

function viewApplication(applicationId) {
    // Implement view details modal or redirect to details page
    alert(`View application details for ID: ${applicationId}`);
}
</script>
```

---

## Adding Loading and Message Elements

Add these elements to your HTML pages (preferably near the top of `<body>`):

```html
<!-- Loading Spinner -->
<div id="loading" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(255,255,255,0.9); padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
    <div style="text-align: center;">
        <i class="fa fa-spinner fa-spin" style="font-size: 40px; color: rgb(10, 10, 110);"></i>
        <p style="margin-top: 10px; color: rgb(10, 10, 110); font-weight: 600;">Loading...</p>
    </div>
</div>

<!-- Success Message -->
<div id="success-message" style="display: none; position: fixed; top: 20px; right: 20px; background: #d4edda; color: #155724; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 9999; border-left: 4px solid #28a745;">
    <i class="fa fa-check-circle"></i> <span></span>
</div>

<!-- Error Message -->
<div id="error-message" style="display: none; position: fixed; top: 20px; right: 20px; background: #f8d7da; color: #721c24; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 9999; border-left: 4px solid #dc3545;">
    <i class="fa fa-exclamation-circle"></i> <span></span>
</div>
```

---

## Testing Your Integration

### 1. Test Login
- Go to login.html
- Login with: admin@edunova.edu / admin123
- Should redirect to admin.html

### 2. Test Contact Form
- Go to contact.html
- Fill and submit form
- Should see success message

### 3. Test Courses
- Go to courses.html
- Should see all courses from database
- Click "Apply Now" (should redirect to login if not logged in)

### 4. Test Dashboard
- Login as student
- Should see applications
- Should see statistics

### 5. Test Admin Panel
- Login as admin
- Should see admin dashboard
- Should see all applications
- Try approving/rejecting applications

---

## Common Issues

1. **CORS Error**: Make sure backend server is running on port 5000
2. **401 Unauthorized**: Token might be expired, try logging in again
3. **Courses not loading**: Check browser console for errors
4. **Forms not submitting**: Check if form IDs match the script

---

That's it! Your frontend is now fully integrated with the backend API.
