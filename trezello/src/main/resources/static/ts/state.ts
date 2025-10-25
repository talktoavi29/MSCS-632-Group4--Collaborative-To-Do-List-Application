import type { Task, User, Status, Role } from './types.js';

export const State = {
  currentUser: { id: '68f31e79-2c2b-4f15-a421-f08e26ff25af', role: 'ADMIN' as Role },
  users: [] as User[],
  tasks: [] as Task[],
  filters: { status: '' as '' | Status, category: '', assigneeId: '' },

  setUsers(u: User[]) { this.users = u; },
  setTasks(t: Task[]) { this.tasks = t; },
  setFilters(f: Partial<typeof this.filters>) { this.filters = { ...this.filters, ...f }; }
};
