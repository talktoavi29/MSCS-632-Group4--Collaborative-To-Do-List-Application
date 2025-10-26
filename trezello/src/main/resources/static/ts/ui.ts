import { State } from './state.js';
import type { Task, User, Status } from './types.js';

type Handlers = {
  selectUser?: (userId: string) => void;
  selectTask?: (taskId: string) => void;

  createTask?: (body: {
    title: string;
    category: string;
    description?: string;
    assigneeId: string;
  }) => void;

  updateTask?: (
    id: string,
    body: {
      title: string;
      category: string;
      description?: string;
      assigneeId: string;
      status?: Status;
      version: number;
    }
  ) => void;

  completeTask?: (id: string, version: number) => void;
  deleteTask?: (id: string) => void;
};

export const UI = {
  root: null as HTMLElement | null,
  handlers: {} as Handlers,

  mount(el: HTMLElement) { this.root = el; },

  render() {
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
            <div class="title">TASKS ${escapeHtml(selectedUser.username)}</div>
            ${this.createForm(selectedUser.id, isAdmin)}
            ${
              State.tasks.length
                ? `<div class="list-tasks">${State.tasks.map(t => this.taskItem(t)).join('')}</div>`
                : `<div class="empty">No tasks for ${escapeHtml(selectedUser.username)}.</div>`
            }
          `
          : `<div class="empty">Select a user to view tasks.</div>`
        }
      </section>

      <section class="pane detail">
        ${
          selectedTask
            ? this.taskDetail(selectedTask, isAdmin)
            : `<div class="empty">Select a task to view details.</div>`
        }
      </section>
    `;

    // User selection
    this.root.querySelectorAll<HTMLLIElement>('.users .item').forEach(li => {
      li.onclick = () => this.handlers.selectUser?.(li.dataset.id!);
    });

    // Create form
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

    // Task selection
    this.root.querySelectorAll<HTMLDivElement>('.task').forEach(div => {
      div.onclick = () => this.handlers.selectTask?.(div.dataset.id!);
    });

    // Edit form
    const ef = this.root.querySelector<HTMLFormElement>('#edit-task-form');
    if (ef) {
      ef.onsubmit = e => {
        e.preventDefault();
        const fd = new FormData(ef);
        const body = Object.fromEntries(fd) as any;
        const id = body.id as string;
        const version = parseInt(body.version, 10);

        // Defensive fallback for assigneeId
        const current = State.selectedTask;
        const assigneeId =
          body.assigneeId ??
          current?.assigneeId ??
          State.selectedUserId;

        const payload = {
          title: (body.title || '').trim(),
          category: (body.category || '').trim(),
          description: (body.description || '').trim() || undefined,
          assigneeId,
          status: (body.status as Status) || undefined,
          version
        };
        this.handlers.updateTask?.(id, payload);
      };
    }

    // Complete button
    const completeBtn = this.root.querySelector<HTMLButtonElement>('#btn-complete');
    if (completeBtn) {
      completeBtn.onclick = () => {
        const id = completeBtn.dataset.id!;
        const version = parseInt(completeBtn.dataset.version!, 10);
        this.handlers.completeTask?.(id, version);
      };
    }

    // Delete button
    const deleteBtn = this.root.querySelector<HTMLButtonElement>('#btn-delete');
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        const id = deleteBtn.dataset.id!;
        if (confirm('Delete this task?')) this.handlers.deleteTask?.(id);
      };
    }
  },

  userItem(u: User) {
    const active = u.id === State.selectedUserId ? 'active' : '';
    return `<li class="item ${active}" data-id="${u.id}">
      <span>${escapeHtml(u.username)}</span>
      <span class="badge">${u.role}</span>
    </li>`;
  },

  taskItem(t: Task) {
    const active = t.id === State.selectedTaskId ? 'active' : '';
    return `<div class="task ${active}" data-id="${t.id}">
      <div class="t1">${escapeHtml(t.title)}</div>
      <div class="t2">${escapeHtml(t.category || '')} • ${t.status}</div>
      <div class="chips">
        <span class="chip">v${t.version}</span>
        <span class="chip">${new Date(t.updatedAt).toLocaleString()}</span>
      </div>
    </div>`;
  },

  createForm(defaultAssignee: string, isAdmin: boolean) {
    const assigneeCtrl = isAdmin
      ? `<select name="assigneeId">
           ${State.users.map(u => `
             <option value="${u.id}" ${u.id === defaultAssignee ? 'selected' : ''}>
               ${escapeHtml(u.username)}
             </option>`).join('')}
         </select>`
      : `<input name="assigneeId" type="hidden" value="${defaultAssignee}" />`;

    return `
      <form id="create-task-form" class="form">
        <input name="title" placeholder="New task title" required />
        <input name="category" placeholder="Category" />
        <input name="description" placeholder="Description" />
        ${assigneeCtrl}
        <button class="primary">Create</button>
      </form>
    `;
  },

  taskDetail(t: Task, isAdmin: boolean) {
    // Admins may edit assignee; Users cannot. For users, include hidden field so value submits.
    const assigneeInput = isAdmin
      ? `<input name="assigneeId" value="${t.assigneeId}" />`
      : `
         <input name="assigneeId" value="${t.assigneeId}" readonly />
         <input type="hidden" name="assigneeId" value="${t.assigneeId}" />
        `;

    // Ensure status options align with backend: PENDING, IN_PROGRESS, COMPLETED
    const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED']
      .map(s => `<option value="${s}" ${s === t.status ? 'selected' : ''}>${s}</option>`)
      .join('');

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
          <select name="status">
            ${statusOptions}
          </select>

          <label>Assignee</label>
          ${assigneeInput}

          <div class="btns">
            <button class="primary" type="submit">Save</button>
            <button id="btn-complete" type="button" class="secondary" data-id="${t.id}" data-version="${t.version}">
              Mark Completed
            </button>
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

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
