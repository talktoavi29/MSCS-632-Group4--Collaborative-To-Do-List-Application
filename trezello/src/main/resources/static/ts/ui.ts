import { State } from './state.js';
import type { Task, User, Status, Role } from './types.js';

type Handlers = {
  selectUser?: (userId: string) => void;
  selectTask?: (taskId: string) => void;

  createTask?: (body: { title: string; category: string; description?: string; assigneeId: string }) => void;
  updateTask?: (id: string, body: {
    title: string; category: string; description?: string; assigneeId: string; status?: Status; version: number
  }) => void;
  completeTask?: (id: string, version: number) => void;
  deleteTask?: (id: string) => void;
};

export const UI = {
  root: null as HTMLElement | null,
  handlers: {} as Handlers,

  mount(el: HTMLElement){ this.root = el; },

  render(){
    if (!this.root) return;

    const isAdmin = State.currentUser.role === 'ADMIN';
    const selectedUser = State.selectedUser;
    const selectedTask = State.selectedTask;

    this.root.innerHTML = `
      <aside class="pane users">
        <div class="title">USERS</div>
        <ul class="list">
          ${State.users.map(u => this.userItem(u)).join('')}
        </ul>
      </aside>

      <section class="pane tasks">
        ${
          selectedUser
          ? `
            <div class="title">TASKS — ${selectedUser.username}</div>
            ${this.createForm(selectedUser.id, isAdmin)}
            ${State.tasks.length ? `<div class="list-tasks">${State.tasks.map(t => this.taskItem(t)).join('')}</div>`
                                  : `<div class="empty">No tasks for ${selectedUser.username}.</div>`}
          `
          : `<div class="empty">Select a user to view tasks.</div>`
        }
      </section>

      <section class="pane detail">
        ${selectedTask ? this.taskDetail(selectedTask, isAdmin) : `<div class="empty">Select a task to view details.</div>`}
      </section>
    `;

    this.root.querySelectorAll<HTMLLIElement>('.users .item').forEach(li => {
      li.onclick = () => this.handlers.selectUser?.(li.dataset.id!);
    });

    const cf = this.root.querySelector<HTMLFormElement>('#create-task-form');
    if (cf) {
      cf.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(cf);
        const body = Object.fromEntries(fd) as any;
        this.handlers.createTask?.({
          title: (body.title || '').trim(),
          category: (body.category || '').trim(),
          description: (body.description || '').trim() || undefined,
          assigneeId: body.assigneeId
        });
        cf.reset();
      };
    }

    this.root.querySelectorAll<HTMLDivElement>('.task').forEach(div => {
      div.onclick = () => this.handlers.selectTask?.(div.dataset.id!);
    });

    const ef = this.root.querySelector<HTMLFormElement>('#edit-task-form');
    if (ef) {
      ef.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(ef);
        const body = Object.fromEntries(fd) as any;
        const id = body.id as string;
        const version = parseInt(body.version, 10);
        const payload = {
          title: (body.title || '').trim(),
          category: (body.category || '').trim(),
          description: (body.description || '').trim() || undefined,
          assigneeId: body.assigneeId,
          status: body.status as Status | undefined,
          version
        };
        this.handlers.updateTask?.(id, payload);
      };
    }

    const completeBtn = this.root.querySelector<HTMLButtonElement>('#btn-complete');
    if (completeBtn) {
      completeBtn.onclick = () => {
        const id = completeBtn.dataset.id!;
        const version = parseInt(completeBtn.dataset.version!, 10);
        this.handlers.completeTask?.(id, version);
      };
    }

    const deleteBtn = this.root.querySelector<HTMLButtonElement>('#btn-delete');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        const id = deleteBtn.dataset.id!;
        if (confirm('Delete this task?')) this.handlers.deleteTask?.(id);
      };
    }
  },

  userItem(u: User){
    const active = u.id === State.selectedUserId ? 'active' : '';
    return `<li class="item ${active}" data-id="${u.id}">
      <span>${u.username}</span>
      <span class="badge">${u.role}</span>
    </li>`;
  },

  taskItem(t: Task){
    const active = t.id === State.selectedTaskId ? 'active' : '';
    return `<div class="task ${active}" data-id="${t.id}">
      <div class="t1">${t.title}</div>
      <div class="t2">${t.category} • ${t.status}</div>
      <div class="chips">
        <span class="chip">v${t.version}</span>
        <span class="chip">${new Date(t.updatedAt).toLocaleString()}</span>
      </div>
    </div>`;
  },

  createForm(defaultAssignee: string, isAdmin: boolean){
    // Admin can pick any assignee (selected user by default). User will only ever see themselves in the left list anyway.
    return `
      <form id="create-task-form" class="form">
        <input name="title" placeholder="New task title" required />
        <input name="category" placeholder="Category" />
        <input name="description" placeholder="Description" />
        ${ isAdmin
            ? `<input name="assigneeId" placeholder="Assignee ID" value="${defaultAssignee}" />`
            : `<input name="assigneeId" type="hidden" value="${defaultAssignee}" />`
        }
        <button class="primary">Create</button>
      </form>
    `;
  },

  taskDetail(t: Task, isAdmin: boolean){
    // Admins can edit assignee; Users cannot (server also enforces)
    const assigneeInput = isAdmin
      ? `<input name="assigneeId" value="${t.assigneeId}" />`
      : `<input name="assigneeId" value="${t.assigneeId}" disabled />`;

    return `
      <div class="detail">
        <h2>Edit Task</h2>
        <form id="edit-task-form" class="form-grid">
          <input type="hidden" name="id" value="${t.id}" />
          <input type="hidden" name="version" value="${t.version}" />

          <label>Title</label>
          <input name="title" value="${escapeHtml(t.title)}" required />

          <label>Category</label>
          <input name="category" value="${escapeHtml(t.category || '')}" />

          <label>Description</label>
          <textarea name="description" rows="3">${escapeHtml(t.description || '')}</textarea>

          <label>Status</label>
          <select name="status" value="${t.status}">
            ${['PENDING','IN_PROGRESS','COMPLETED'].map(s => `<option value="${s}" ${s===t.status?'selected':''}>${s}</option>`).join('')}
          </select>

          <label>Assignee</label>
          ${assigneeInput}

          <div class="btns">
            <button class="primary" type="submit">Save</button>
            <button id="btn-complete" type="button" class="secondary" data-id="${t.id}" data-version="${t.version}">Mark Completed</button>
            ${isAdmin ? `<button id="btn-delete" type="button" class="danger" data-id="${t.id}">Delete</button>` : ''}
          </div>
        </form>

        <div class="kv" style="margin-top:10px">
          <div class="k">ID</div><div class="v">${t.id}</div>
          <div class="k">Version</div><div class="v">v${t.version}</div>
          <div class="k">Created</div><div class="v">${new Date(t.createdAt).toLocaleString()}</div>
          <div class="k">Updated</div><div class="v">${new Date(t.updatedAt).toLocaleString()}</div>
        </div>
      </div>
    `;
  }
};

function escapeHtml(s: string){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)); }
