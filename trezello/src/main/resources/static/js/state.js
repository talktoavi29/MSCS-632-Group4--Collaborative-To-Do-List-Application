export const State = {
    currentUser: { id: '68f31e79-2c2b-4f15-a421-f08e26ff25af', role: 'ADMIN' },
    users: [],
    tasks: [],
    filters: { status: '', category: '', assigneeId: '' },
    setUsers(u) { this.users = u; },
    setTasks(t) { this.tasks = t; },
    setFilters(f) { this.filters = { ...this.filters, ...f }; }
};
