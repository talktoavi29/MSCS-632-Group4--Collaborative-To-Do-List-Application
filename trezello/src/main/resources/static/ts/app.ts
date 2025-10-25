import { API } from './api.js';
import { State } from './state.js';
import { UI } from './ui.js';
import type { Status } from './types.js';

const App = {
  async init(){
    UI.mount(document.getElementById('app')!);

    // wire handlers
    UI.handlers.selectUser   = id => this.onSelectUser(id);
    UI.handlers.selectTask   = id => this.onSelectTask(id);
    UI.handlers.createTask   = body => this.createTask(body);
    UI.handlers.updateTask   = (id, body) => this.updateTask(id, body);
    UI.handlers.completeTask = (id, v) => this.completeTask(id, v);
    UI.handlers.deleteTask   = id => this.deleteTask(id);

    await this.loadUsers();

    // if USER, auto-select self; if ADMIN, wait for click
    if (State.currentUser.role === 'USER') {
      State.selectUser(State.currentUser.id);
      await this.loadTasksFor(State.currentUser.id);
    }

    UI.render();
  },

  async loadUsers(){
    try {
      const users = await API.listUsers();
      State.setUsers(users);
    } catch (e:any) {
      alert(e.message || 'Failed to load users');
    }
  },

  async loadTasksFor(userId: string){
    try {
      const tasks = await API.listTasks({ assigneeId: userId });
      State.setTasks(tasks);
    } catch (e:any) {
      alert(e.message || 'Failed to load tasks');
    }
  },

  async onSelectUser(userId: string){
    State.selectUser(userId);
    await this.loadTasksFor(userId);
    UI.render();
  },

  onSelectTask(taskId: string){
    State.selectTask(taskId);
    UI.render();
  },

  async createTask(body: { title:string; category:string; description?:string; assigneeId:string }){
    try {
      await API.createTask(body);
      await this.loadTasksFor(State.selectedUserId);
      UI.render();
    } catch (e:any) {
      alert(e.message || 'Create failed');
    }
  },

  async updateTask(id: string, body: {
    title:string; category:string; description?:string; assigneeId:string; status?: Status; version:number
  }){
    try {
      await API.updateTask(id, body);
      await this.loadTasksFor(State.selectedUserId);
      // keep same selection (id may still exist; if deleted in race, the list will drop it)
      State.selectTask(id);
      UI.render();
    } catch (e:any) {
      if (e.status === 409) {
        alert('This task changed on the server. Reloaded latest.');
        await this.loadTasksFor(State.selectedUserId);
        UI.render();
      } else {
        alert(e.message || 'Update failed');
      }
    }
  },

  async completeTask(id: string, version: number){
    try {
      await API.completeTask(id, version);
      await this.loadTasksFor(State.selectedUserId);
      State.selectTask(id);
      UI.render();
    } catch (e:any) {
      if (e.status === 409) {
        alert('This task changed on the server. Reloaded latest.');
        await this.loadTasksFor(State.selectedUserId);
        UI.render();
      } else {
        alert(e.message || 'Complete failed');
      }
    }
  },

  async deleteTask(id: string){
    try {
      await API.deleteTask(id);
      await this.loadTasksFor(State.selectedUserId);
      // if you deleted the selected task, clear the detail pane
      if (State.selectedTaskId === id) State.selectTask('');
      UI.render();
    } catch (e:any) {
      alert(e.message || 'Delete failed');
    }
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
