export type Role = 'ADMIN' | 'USER';
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User { id:string; username:string; role:Role; }
export interface Task {
  id:string; title:string; description?:string; category:string; status:Status;
  assigneeId:string; version:number; createdAt:string; updatedAt:string;
}
export interface CreateTask { title:string; description?:string; category:string; assigneeId:string; }
export interface UpdateTask extends CreateTask { status?: Status; version:number; }
