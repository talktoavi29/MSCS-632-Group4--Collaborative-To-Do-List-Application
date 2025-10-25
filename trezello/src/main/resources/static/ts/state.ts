import type { User, Task, Status, Role } from './types.js';

export const State = {
  // currentUser: { id: '68f31e79-2c2b-4f15-a421-f08e26ff25af', role: 'ADMIN' as Role },

    currentUser: { id: 'a51eba5d-db11-4a35-99d2-e35b04796b88', role: 'USER' as Role },

  users: [] as User[],
  tasks: [] as Task[],

  selectedUserId: '' as string,
  selectedTaskId: '' as string,

  filters: { status: '' as '' | Status, category: '', assigneeId: '' },

  get selectedUser(): User | undefined { return this.users.find(u => u.id === this.selectedUserId); },
  get selectedTask(): Task | undefined { return this.tasks.find(t => t.id === this.selectedTaskId); },

  setUsers(u: User[]) { this.users = u; },
  setTasks(t: Task[]) { this.tasks = t; },
  selectUser(id: string) { this.selectedUserId = id; this.selectedTaskId = ''; },
  selectTask(id: string) { this.selectedTaskId = id; },
  clearSelection() { this.selectedUserId = ''; this.selectedTaskId=''; }
};
