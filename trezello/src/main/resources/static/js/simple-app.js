// Simple App Logic - Production Ready

const API_URL = 'http://localhost:8080';
const USE_MOCK = true; // Set to false when backend is ready

// Mock data for testing
let mockTasks = [
    {
        id: '1',
        title: 'Setup project',
        description: 'Initialize repository',
        category: 'Setup',
        status: 'DONE',
        assigneeId: 'alice-id',
        version: 1
    },
    {
        id: '2',
        title: 'Write report',
        description: 'Q4 planning',
        category: 'Work',
        status: 'IN_PROGRESS',
        assigneeId: 'alice-id',
        version: 1
    },
    {
        id: '3',
        title: 'Review code',
        description: 'Check pull requests',
        category: 'Development',
        status: 'PENDING',
        assigneeId: 'bob-id',
        version: 1
    },
    {
        id: '4',
        title: 'Database migration',
        description: 'Update schema',
        category: 'Backend',
        status: 'IN_PROGRESS',
        assigneeId: 'admin-id',
        version: 2
    }
];

// Check if logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = '/login.html';
}

// Elements
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const newTaskBtn = document.getElementById('newTaskBtn');
const taskList = document.getElementById('taskList');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const cancelTaskBtn = document.getElementById('cancelTask');
const modalTitle = document.getElementById('modalTitle');

// Set user info
userName.textContent = user.username;
userRole.textContent = user.role;
userRole.classList.add(user.role.toLowerCase());

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
});

// API helper with headers
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
        'X-Role': user.role,
        ...options.headers
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    // Handle errors
    if (response.status === 403) {
        alert('You do not have permission to perform this action');
        throw new Error('Forbidden');
    }
    
    if (response.status === 409) {
        const error = await response.json().catch(() => ({}));
        alert(error.error || 'Version mismatch. The task was modified by someone else. Please refresh.');
        throw new Error('Conflict');
    }
    
    if (response.status === 404) {
        alert('Resource not found');
        throw new Error('Not found');
    }
    
    if (!response.ok) {
        throw new Error('Request failed');
    }
    
    // Return JSON if present
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    
    return null;
}

// Load tasks
async function loadTasks() {
    try {
        let tasks;
        
        if (USE_MOCK) {
            // Mock: Admin sees all, User sees only their own
            tasks = user.role === 'ADMIN' 
                ? mockTasks 
                : mockTasks.filter(t => t.assigneeId === user.id);
        } else {
            // Real API: Backend filters based on role automatically
            tasks = await apiCall('/tasks');
        }
        
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        taskList.innerHTML = '<div class="empty-state"><p>Failed to load tasks</p></div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>No tasks yet</p>
                <p>Create your first task!</p>
            </div>
        `;
        return;
    }
    
    taskList.innerHTML = tasks.map(task => `
        <div class="task-card">
            <div class="task-card-header">
                <div class="task-title">${task.title}</div>
                <span class="task-status ${task.status.toLowerCase().replace('_', '-')}">${formatStatus(task.status)}</span>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span>📁 ${task.category}</span>
                <span>👤 ${getAssigneeName(task.assigneeId)}</span>
                <span>v${task.version}</span>
            </div>
            <div class="task-actions">
                ${canEdit(task) ? `<button onclick="editTask('${task.id}')" class="btn-primary">Edit</button>` : ''}
                ${canEdit(task) && task.status !== 'DONE' ? `<button onclick="completeTask('${task.id}', ${task.version})" class="btn-secondary">Complete</button>` : ''}
                ${canDelete() ? `<button onclick="deleteTask('${task.id}')" class="btn-danger">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Get assignee name (simplified)
function getAssigneeName(assigneeId) {
    if (assigneeId === user.id) return 'You';
    return assigneeId.replace('-id', '');
}

// Format status
function formatStatus(status) {
    const map = {
        'PENDING': 'Pending',
        'IN_PROGRESS': 'In Progress',
        'DONE': 'Done'
    };
    return map[status] || status;
}

// Check permissions
function canEdit(task) {
    return user.role === 'ADMIN' || task.assigneeId === user.id;
}

function canDelete() {
    return user.role === 'ADMIN';
}

// Show new task modal
newTaskBtn.addEventListener('click', () => {
    modalTitle.textContent = 'New Task';
    taskForm.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskVersion').value = '';
    document.getElementById('taskStatus').value = 'PENDING';
    taskModal.classList.add('show');
});

// Edit task
window.editTask = function(taskId) {
    const task = USE_MOCK 
        ? mockTasks.find(t => t.id === taskId)
        : null;
    
    if (USE_MOCK && !task) return;
    
    // In real mode, we would fetch the task first
    // For simplicity, we'll use the task from the displayed list
    const taskCard = event.target.closest('.task-card');
    const title = taskCard.querySelector('.task-title').textContent;
    const description = taskCard.querySelector('.task-description')?.textContent || '';
    const category = taskCard.querySelector('.task-meta span:first-child').textContent.replace('📁 ', '');
    const statusText = taskCard.querySelector('.task-status').textContent;
    const versionText = taskCard.querySelector('.task-meta span:last-child').textContent;
    const version = parseInt(versionText.replace('v', ''));
    
    // Map status text back to enum
    const statusMap = {
        'Pending': 'PENDING',
        'In Progress': 'IN_PROGRESS',
        'Done': 'DONE'
    };
    const status = USE_MOCK ? task.status : statusMap[statusText];
    
    modalTitle.textContent = 'Edit Task';
    document.getElementById('taskId').value = taskId;
    document.getElementById('taskVersion').value = USE_MOCK ? task.version : version;
    document.getElementById('taskTitle').value = USE_MOCK ? task.title : title;
    document.getElementById('taskDescription').value = USE_MOCK ? (task.description || '') : description;
    document.getElementById('taskCategory').value = USE_MOCK ? task.category : category;
    document.getElementById('taskStatus').value = status;
    taskModal.classList.add('show');
};

// Complete task - matches PATCH /tasks/{id}/complete with version in body
window.completeTask = async function(taskId, currentVersion) {
    try {
        if (USE_MOCK) {
            const task = mockTasks.find(t => t.id === taskId);
            if (task) {
                task.status = 'DONE';
                task.version++;
            }
        } else {
            // Backend expects: PATCH /tasks/{id}/complete with body: { version }
            await apiCall(`/tasks/${taskId}/complete`, {
                method: 'PATCH',
                body: JSON.stringify({ version: currentVersion })
            });
        }
        loadTasks();
    } catch (error) {
        console.error('Error completing task:', error);
        loadTasks(); // Refresh to show current state
    }
};

// Delete task - matches DELETE /tasks/{id} (Admin only)
window.deleteTask = async function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        if (USE_MOCK) {
            mockTasks = mockTasks.filter(t => t.id !== taskId);
        } else {
            // Backend: DELETE /tasks/{id}
            await apiCall(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
        }
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        loadTasks(); // Refresh to show current state
    }
};

// Save task (create or update)
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value.trim();
    const status = document.getElementById('taskStatus').value;
    const version = parseInt(document.getElementById('taskVersion').value) || 1;
    
    if (!title || !category) {
        alert('Title and Category are required');
        return;
    }
    
    try {
        if (USE_MOCK) {
            if (taskId) {
                // Update
                const task = mockTasks.find(t => t.id === taskId);
                if (task) {
                    task.title = title;
                    task.description = description;
                    task.category = category;
                    task.status = status;
                    task.version++;
                }
            } else {
                // Create
                mockTasks.push({
                    id: Date.now().toString(),
                    title,
                    description,
                    category,
                    status: 'PENDING',
                    assigneeId: user.id,
                    version: 1
                });
            }
        } else {
            if (taskId) {
                // Update - matches PUT /tasks/{id}
                // Backend expects: title, description, category, assigneeId, status, version
                await apiCall(`/tasks/${taskId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        title,
                        description,
                        category,
                        assigneeId: user.id,
                        status,
                        version
                    })
                });
            } else {
                // Create - matches POST /tasks
                // Backend expects: title, description, category, assigneeId
                await apiCall('/tasks', {
                    method: 'POST',
                    body: JSON.stringify({
                        title,
                        description,
                        category,
                        assigneeId: user.id
                    })
                });
            }
        }
        
        taskModal.classList.remove('show');
        loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        loadTasks(); // Refresh to show current state
    }
});

// Cancel task modal
cancelTaskBtn.addEventListener('click', () => {
    taskModal.classList.remove('show');
});

// Close modal on outside click
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        taskModal.classList.remove('show');
    }
});

// Load tasks on page load
loadTasks();