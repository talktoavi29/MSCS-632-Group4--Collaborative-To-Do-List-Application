import type { User, Task, Status, Role } from './types.js';

function loadUser(): { id:string; username:string; role:Role } | null {
  try { return JSON.parse(localStorage.getItem('trezello.user') || 'null'); }
  catch { return null; }
}

export const State = {
  currentUser: (loadUser() ?? { id: '', username: '', role: 'USER' as Role }),

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