import { State } from './state.js';
export const UI = {
    root: null,
    handlers: {},
    mount(el) { this.root = el; },
    render() {
        if (!this.root)
            return;
        this.root.innerHTML = `
      <aside class="pane users">
        <div class="title">USERS</div>
        <ul class="list">
          ${State.users.map(u => this.userItem(u)).join('')}
        </ul>
      </aside>

      <section class="pane tasks">
        ${State.selectedUser ? this.taskList(State.selectedUser) : `<div class="empty">Select a user to view tasks.</div>`}
      </section>

      <section class="pane detail">
        ${State.selectedTask ? this.taskDetail(State.selectedTask) : `<div class="empty">Select a task to view details.</div>`}
      </section>
    `;
        // Bind user clicks
        this.root.querySelectorAll('.users .item').forEach(li => {
            li.onclick = () => this.handlers.selectUser?.(li.dataset.id);
        });
        // Bind task clicks
        this.root.querySelectorAll('.task').forEach(div => {
            div.onclick = () => this.handlers.selectTask?.(div.dataset.id);
        });
    },
    userItem(u) {
        const active = u.id === State.selectedUserId ? 'active' : '';
        return `<li class="item ${active}" data-id="${u.id}">
      <span>${u.username}</span>
      <span class="badge">${u.role}</span>
    </li>`;
    },
    taskList(user) {
        if (!State.tasks.length)
            return `<div class="empty">No tasks for ${user.username}.</div>`;
        const items = State.tasks.map(t => this.taskItem(t)).join('');
        return `<div class="title">TASKS — ${user.username}</div>
            <div class="list-tasks">${items}</div>`;
    },
    taskItem(t) {
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
    taskDetail(t) {
        return `
      <div class="detail">
        <h2>${t.title}</h2>
        <div class="meta">
          <span class="chip">${t.status}</span>
          <span class="chip">Category: ${t.category}</span>
          <span class="chip">Assignee: ${t.assigneeId}</span>
          <span class="chip">v${t.version}</span>
        </div>
        <div class="kv">
          <div class="k">Description</div><div class="v">${t.description ?? '-'}</div>
          <div class="k">Created</div><div class="v">${new Date(t.createdAt).toLocaleString()}</div>
          <div class="k">Updated</div><div class="v">${new Date(t.updatedAt).toLocaleString()}</div>
          <div class="k">ID</div><div class="v">${t.id}</div>
        </div>
        <div class="btns">
          <!-- actions can be added later (complete/delete) -->
        </div>
      </div>
    `;
    }
};
