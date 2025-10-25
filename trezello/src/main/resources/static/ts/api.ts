import type { Task, User, CreateTask, UpdateTask } from './types.js';
import { State } from './state.js';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { id, role } = State.currentUser;
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': id, 'X-Role': role },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data.error || res.statusText);
    err.status = res.status; throw err;
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

export const API = {
  listUsers(): Promise<User[]> { return request<User[]>('GET', '/users'); },
  listTasks(q: Record<string,string|undefined> = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    for (const [k,v] of Object.entries(q)) if (typeof v === 'string' && v.length) params.append(k,v);
    const qs = params.toString();
    return request<Task[]>('GET', `/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask(b: CreateTask): Promise<Task> { return request<Task>('POST','/tasks',b); },
  updateTask(id: string, b: UpdateTask): Promise<Task> { return request<Task>('PUT', `/tasks/${id}`, b); },
  completeTask(id: string, version: number): Promise<Task> { return request<Task>('PATCH', `/tasks/${id}/complete`, { version }); },
  deleteTask(id: string): Promise<null> { return request<null>('DELETE', `/tasks/${id}`); },
};
