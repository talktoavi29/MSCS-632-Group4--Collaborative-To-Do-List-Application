import type { Task, User, Status, Role } from './types.js';

export const State = {
  currentUser: { id: 'REPLACE_WITH_REAL_ID', role: 'USER' as Role },
  users: [] as User[],
  tasks: [] as Task[],
  filters: { status: '' as '' | Status, category: '', assigneeId: '' },

  setUsers(u: User[]) { this.users = u; },
  setTasks(t: Task[]) { this.tasks = t; },
  setFilters(f: Partial<typeof this.filters>) { this.filters = { ...this.filters, ...f }; }
};
