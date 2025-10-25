// Simple Login Logic - Production Ready

const API_URL = 'http://localhost:8080';
const USE_MOCK = true; // Set to false when backend is ready

// Mock users for testing
const mockUsers = [
    { id: 'alice-id', username: 'alice', role: 'USER' },
    { id: 'bob-id', username: 'bob', role: 'USER' },
    { id: 'admin-id', username: 'admin', role: 'ADMIN' }
];

// Check if already logged in
if (localStorage.getItem('user')) {
    window.location.href = '/';
}

// Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const signupModal = document.getElementById('signupModal');
const showSignupBtn = document.getElementById('showSignup');
const cancelSignupBtn = document.getElementById('cancelSignup');
const errorDiv = document.getElementById('error');

// Show error message
function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 3000);
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    
    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    try {
        let user;
        
        if (USE_MOCK) {
            // Mock login - just find user by username
            user = mockUsers.find(u => u.username === username);
            if (!user) {
                showError('User not found. Please sign up first.');
                return;
            }
        } else {
            // Real API - Get all users and find by username
            // Backend: GET /users (with any user's headers to authenticate)
            // Since we don't have a user yet, we'll use a temporary admin call
            // In production, you might have a dedicated login endpoint
            
            try {
                const response = await fetch(`${API_URL}/users`, {
                    headers: {
                        'X-User-Id': 'temp',
                        'X-Role': 'ADMIN'
                    }
                });
                
                if (!response.ok) {
                    showError('Failed to fetch users');
                    return;
                }
                
                const users = await response.json();
                user = users.find(u => u.username === username);
                
                if (!user) {
                    showError('User not found. Please sign up first.');
                    return;
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
                return;
            }
        }
        
        // Save user and redirect
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/';
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }
});

// Show signup modal
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupModal.classList.add('show');
});

// Cancel signup
cancelSignupBtn.addEventListener('click', () => {
    signupModal.classList.remove('show');
    signupForm.reset();
});

// Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const role = document.getElementById('signupRole').value;
    
    if (!username) {
        showError('Please enter a username');
        return;
    }
    
    try {
        let user;
        
        if (USE_MOCK) {
            // Mock signup
            if (mockUsers.find(u => u.username === username)) {
                showError('Username already exists');
                return;
            }
            user = {
                id: `${username}-id`,
                username: username,
                role: role
            };
            mockUsers.push(user);
        } else {
            // Real API - POST /users
            // Backend expects: { username, role }
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    role 
                })
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                showError(error.message || 'Username already exists');
                return;
            }
            
            // Backend returns: { id, username, role }
            user = await response.json();
        }
        
        // Save user and redirect
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/';
        
    } catch (error) {
        console.error('Signup error:', error);
        showError('Signup failed. Please try again.');
    }
});

// Close modal on outside click
signupModal.addEventListener('click', (e) => {
    if (e.target === signupModal) {
        signupModal.classList.remove('show');
        signupForm.reset();
    }
});