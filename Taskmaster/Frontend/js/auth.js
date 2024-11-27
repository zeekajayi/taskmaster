class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('token');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('login').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logout').addEventListener('click', () => this.handleLogout());
        document.getElementById('show-register').addEventListener('click', () => this.toggleForms('register'));
        document.getElementById('show-login').addEventListener('click', () => this.toggleForms('login'));

        // Check authentication status on load
        this.checkAuthStatus();
    }

    toggleForms(form) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (form === 'register') {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        } else {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${this.baseURL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();
            this.setToken(data.token);
            this.showApp();
            form.reset();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const form = e.target;
        const username = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${this.baseURL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) throw new Error('Registration failed');

            const data = await response.json();
            this.setToken(data.token);
            this.showApp();
            form.reset();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    handleLogout() {
        localStorage.removeItem('token');
        this.token = null;
        this.hideApp();
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    checkAuthStatus() {
        if (this.token) {
            this.showApp();
        } else {
            this.hideApp();
        }
    }

    showApp() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        // Initialize task management
        new TaskManager(this.token);
    }

    hideApp() {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
}

// Initialize authentication
new AuthService();