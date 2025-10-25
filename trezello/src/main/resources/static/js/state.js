export const State = {
    currentUser: { id: '68f31e79-2c2b-4f15-a421-f08e26ff25af', role: 'ADMIN' },
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
