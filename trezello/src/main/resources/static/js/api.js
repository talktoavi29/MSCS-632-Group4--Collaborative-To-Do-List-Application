import { State } from './state.js';
async function request(method, path, body) {
    const { id, role } = State.currentUser;
    const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-User-Id': id },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = new Error(data.error || res.statusText);
        err.status = res.status;
        throw err;
    }
    return (res.status === 204 ? null : await res.json());
}
export const API = {
    listUsers() { return request('GET', '/users'); },
    listTasks(q = {}) {
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(q))
            if (typeof v === 'string' && v.length)
                params.append(k, v);
        const qs = params.toString();
        return request('GET', `/tasks${qs ? `?${qs}` : ''}`);
    },
    createTask(b) { return request('POST', '/tasks', b); },
    updateTask(id, b) { return request('PUT', `/tasks/${id}`, b); },
    completeTask(id, version) { return request('PATCH', `/tasks/${id}/complete`, { version }); },
    deleteTask(id) { return request('DELETE', `/tasks/${id}`); },
};
