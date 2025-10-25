function loadUser() {
    try {
        return JSON.parse(localStorage.getItem('trezello.user') || 'null');
    }
    catch {
        return null;
    }
}
export const State = {
    currentUser: (loadUser() ?? { id: '', username: '', role: 'USER' }),
    users: [],
    tasks: [],
    selectedUserId: '',
    selectedTaskId: '',
    filters: { status: '', category: '', assigneeId: '' },
    get selectedUser() { return this.users.find(u => u.id === this.selectedUserId); },
    get selectedTask() { return this.tasks.find(t => t.id === this.selectedTaskId); },
    setUsers(u) { this.users = u; },
    setTasks(t) { this.tasks = t; },
    selectUser(id) { this.selectedUserId = id; this.selectedTaskId = ''; },
    selectTask(id) { this.selectedTaskId = id; },
    clearSelection() { this.selectedUserId = ''; this.selectedTaskId = ''; }
};
