const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface TaskPayload {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string[]; // teacher assigns to multiple students
}

export const assignTasks = async (payload: TaskPayload) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/tasks/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to assign tasks');
  }
  return res.json();
};

export const updateTask = async (taskId: string, updates: any) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update task');
  }
  return res.json();
};

export const getTasks = async (page = 1, limit = 50) => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/tasks?page=${page}&limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch tasks');
  }
  return res.json();
};

export default { assignTasks, updateTask, getTasks };
