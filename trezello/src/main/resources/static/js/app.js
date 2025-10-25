import { API } from './api.js';
import { State } from './state.js';
import { UI } from './ui.js';
const App = {
    async init() {
        UI.mount(document.getElementById('app'));
        UI.handlers.create = body => this.createTask(body);
        UI.handlers.update = (id, body) => this.updateTask(id, body);
        UI.handlers.complete = (id, v) => this.completeTask(id, v);
        UI.handlers.filter = f => { State.setFilters(f); this.refresh(); };
        await this.refresh();
    },
    async refresh(conflict = false) {
        try {
            const tasks = await API.listTasks(State.filters);
            State.setTasks(tasks);
            UI.render(conflict);
        }
        catch (e) {
            alert(e.message || 'Failed to load tasks');
        }
    },
    async createTask(body) {
        body.assigneeId || (body.assigneeId = State.currentUser.id);
        try {
            await API.createTask(body);
            await this.refresh();
        }
        catch (e) {
            alert(e.message);
        }
    },
    async updateTask(id, body) {
        try {
            await API.updateTask(id, body);
            await this.refresh();
        }
        catch (e) {
            if (e.status === 409)
                await this.refresh(true);
            else
                alert(e.message);
        }
    },
    async completeTask(id, version) {
        try {
            await API.completeTask(id, version);
            await this.refresh();
        }
        catch (e) {
            if (e.status === 409)
                await this.refresh(true);
            else
                alert(e.message);
        }
    }
};
window.addEventListener('DOMContentLoaded', () => App.init());
