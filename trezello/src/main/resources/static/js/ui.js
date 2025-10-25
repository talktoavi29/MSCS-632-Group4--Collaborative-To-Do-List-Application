import { State } from './state.js';
export const UI = {
    root: null,
    handlers: {},
    mount(el) { this.root = el; },
    render(conflict = false) {
        if (!this.root)
            return;
        const isAdmin = State.currentUser.role === 'ADMIN';
        const rows = State.tasks.map(t => this.row(t, isAdmin)).join('');
        const banner = conflict ? `<div class="banner">Task changed on server. Reloaded latest.</div>` : '';
        this.root.innerHTML = `
      ${banner}
      <section class="filters">
        <label>Status <input id="f-status" value="${State.filters.status || ''}"></label>
        <label>Category <input id="f-category" value="${State.filters.category || ''}"></label>
        <button id="apply">Apply</button>
      </section>
      <section class="create">
        <form id="create">
          <input name="title" placeholder="Title" required>
          <input name="category" placeholder="Category">
          <input name="description" placeholder="Description">
          <input name="assigneeId" placeholder="Assignee ID" value="${State.currentUser.id}">
          <button>Add</button>
        </form>
      </section>
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Assignee</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
        this.root.querySelector('#apply').onclick = () => {
            const raw = (this.root.querySelector('#f-status').value || '').toUpperCase();
            const status = raw === 'PENDING' || raw === 'IN_PROGRESS' || raw === 'COMPLETED' ? raw : '';
            const category = this.root.querySelector('#f-category').value || '';
            this.handlers.filter?.({ status, category: category || undefined });
        };
        this.root.querySelector('#create').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            this.handlers.create?.(Object.fromEntries(fd));
            e.target.reset();
        };
        this.root.querySelectorAll('tbody tr').forEach(tr => {
            const id = tr.dataset.id;
            tr.querySelector('.edit').onclick = () => {
                const t = State.tasks.find(x => x.id === id);
                this.handlers.update?.(id, { title: t.title + ' *', description: t.description, category: t.category,
                    assigneeId: t.assigneeId, status: t.status, version: t.version });
            };
            tr.querySelector('.done').onclick = () => {
                const t = State.tasks.find(x => x.id === id);
                this.handlers.complete?.(id, t.version);
            };
            const del = tr.querySelector('.del');
            if (del)
                del.onclick = () => this.handlers.del?.(id);
        });
    },
    row(t, isAdmin) {
        return `<tr data-id="${t.id}">
        <td>${t.title}</td>
        <td>${t.category}</td>
        <td>${t.status}</td>
        <td>${t.assigneeId}</td>
        <td>
          <button class="edit">Edit</button>
          <button class="done">Done</button>
          ${isAdmin ? '<button class="del">Delete</button>' : ''}
        </td>
      </tr>`;
    }
};
