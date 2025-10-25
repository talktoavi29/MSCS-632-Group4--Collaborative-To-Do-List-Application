import { API } from './api.js';
import { State } from './state.js';
import { UI } from './ui.js';
const App = {
    async init() {
        UI.mount(document.getElementById('app'));
        UI.handlers.selectUser = (userId) => this.onSelectUser(userId);
        UI.handlers.selectTask = (taskId) => this.onSelectTask(taskId);
        await this.loadUsers();
        // If non-admin, auto-select yourself
        if (State.currentUser.role === 'USER') {
            State.selectUser(State.currentUser.id);
            await this.loadTasksFor(State.currentUser.id);
        }
        UI.render();
    },
    async loadUsers() {
        try {
            const users = await API.listUsers();
            State.setUsers(users);
        }
        catch (e) {
            alert(e.message || 'Failed to load users');
        }
    },
    async loadTasksFor(userId) {
        try {
            const tasks = await API.listTasks({ assigneeId: userId });
            State.setTasks(tasks);
        }
        catch (e) {
            alert(e.message || 'Failed to load tasks');
        }
    },
    async onSelectUser(userId) {
        State.selectUser(userId);
        await this.loadTasksFor(userId);
        UI.render();
    },
    onSelectTask(taskId) {
        State.selectTask(taskId);
        UI.render();
    }
};
window.addEventListener('DOMContentLoaded', () => App.init());
