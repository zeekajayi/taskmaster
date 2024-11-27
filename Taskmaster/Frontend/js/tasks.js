// js/tasks.js
class TaskManager {
    constructor(token) {
        this.baseURL = 'http://localhost:3000/api';
        this.token = token;
        this.tasks = [];
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        document.getElementById('add-task').addEventListener('click', () => this.showTaskModal());
        document.getElementById('close-modal').addEventListener('click', () => this.hideTaskModal());
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('priority-filter').addEventListener('change', () => this.filterTasks());
        document.getElementById('search').addEventListener('input', () => this.filterTasks());
    }

    async loadTasks() {
        try {
            const response = await fetch(`${this.baseURL}/tasks`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to load tasks');

            this.tasks = await response.json();
            this.renderTasks();
        } catch (error) {
            alert('Error loading tasks: ' + error.message);
        }
    }

    renderTasks(tasksToRender = this.tasks) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        tasksToRender.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'task-card';
        div.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            <p>${task.description || ''}</p>
            <div class="task-footer">
                <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
                <div class="task-actions">
                    <button onclick="taskManager.editTask('${task._id}')">Edit</button>
                    <button onclick="taskManager.deleteTask('${task._id}')">Delete</button>
                    <button onclick="taskManager.toggleTaskComplete('${task._id}')">
                        ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    showTaskModal(taskToEdit = null) {
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        modal.classList.remove('hidden');

        if (taskToEdit) {
            form.dataset.taskId = taskToEdit._id;
            form.querySelector('#task-title').value = taskToEdit.title;
            form.querySelector('#task-description').value = taskToEdit.description;
            form.querySelector('#task-deadline').value = taskToEdit.deadline.split('T')[0];
            form.querySelector('#task-priority').value = taskToEdit.priority;
        } else {
            form.reset();
            delete form.dataset.taskId;
        }
    }

    hideTaskModal() {
        document.getElementById('task-modal').classList.add('hidden');
        document.getElementById('task-form').reset();
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const taskData = {
            title: form.querySelector('#task-title').value,
            description: form.querySelector('#task-description').value,
            deadline: form.querySelector('#task-deadline').value,
            priority: form.querySelector('#task-priority').value
        };

        try {
            const isEditing = form.dataset.taskId;
            const url = `${this.baseURL}/tasks${isEditing ? `/${form.dataset.taskId}` : ''}`;
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) throw new Error('Failed to save task');

            const savedTask = await response.json();
            
            if (isEditing) {
                this.tasks = this.tasks.map(task => 
                    task._id === savedTask._id ? savedTask : task
                );
            } else {
                this.tasks.push(savedTask);
            }

            this.hideTaskModal();
            this.renderTasks();
        } catch (error) {
            alert('Error saving task: ' + error.message);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete task');

            this.tasks = this.tasks.filter(task => task._id !== taskId);
            this.renderTasks();
        } catch (error) {
            alert('Error deleting task: ' + error.message);
        }
    }

    async toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t._id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ completed: !task.completed })
            });

            if (!response.ok) throw new Error('Failed to update task');

            const updatedTask = await response.json();
            this.tasks = this.tasks.map(t => 
                t._id === updatedTask._id ? updatedTask : t
            );
            this.renderTasks();
        } catch (error) {
            alert('Error updating task: ' + error.message);
        }
    }

    filterTasks() {
        const priorityFilter = document.getElementById('priority-filter').value;
        const searchTerm = document.getElementById('search').value.toLowerCase();

        const filteredTasks = this.tasks.filter(task => {
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                (task.description && task.description.toLowerCase().includes(searchTerm));
            
            return matchesPriority && matchesSearch;
        });

        this.renderTasks(filteredTasks);
    }

     // Add task categories
     async addCategory(taskId, category) {
        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ category })
            });

            if (!response.ok) throw new Error('Failed to update category');

            const updatedTask = await response.json();
            this.tasks = this.tasks.map(t => 
                t._id === updatedTask._id ? updatedTask : t
            );
            this.renderTasks();
        } catch (error) {
            alert('Error updating category: ' + error.message);
        }
    }

    // Add task statistics
    calculateStatistics() {
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            priority: {
                high: this.tasks.filter(t => t.priority === 'high').length,
                medium: this.tasks.filter(t => t.priority === 'medium').length,
                low: this.tasks.filter(t => t.priority === 'low').length
            },
            upcoming: this.tasks.filter(t => {
                const deadline = new Date(t.deadline);
                const today = new Date();
                return deadline > today && deadline <= new Date(today.setDate(today.getDate() + 7));
            }).length
        };

        this.renderStatistics(stats);
    }

    // Add drag and drop functionality
    enableDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            card.setAttribute('draggable', true);
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragover', this.handleDragOver.bind(this));
            card.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    // Add task export functionality
    exportTasks() {
        const tasksData = JSON.stringify(this.tasks, null, 2);
        const blob = new Blob([tasksData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks-export.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Add task import functionality
    async importTasks(file) {
        try {
            const text = await file.text();
            const tasks = JSON.parse(text);
            
            for (const task of tasks) {
                await this.createTask(task);
            }
            
            this.loadTasks();
        } catch (error) {
            alert('Error importing tasks: ' + error.message);
        }
    }

    // Add task reminders
    setupReminders() {
        setInterval(() => {
            const now = new Date();
            this.tasks.forEach(task => {
                if (!task.completed) {
                    const deadline = new Date(task.deadline);
                    const diff = deadline - now;
                    const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    
                    if (daysDiff === 1) {
                        this.showNotification(`Task "${task.title}" is due tomorrow!`);
                    }
                }
            });
        }, 3600000); // Check every hour
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TaskMaster Reminder', { body: message });
        }
    }
}

// Make taskManager globally available for event handlers
window.taskManager = null;