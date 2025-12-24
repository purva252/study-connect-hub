const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface Connection {
  _id: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  student?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface RequestConnectionPayload {
  teacherId: string; // Either teacher ID or teacher code
}

export interface RespondToInvitePayload {
  action: 'accept' | 'reject';
}

// Get all pending connections for the logged-in user
export const getPendingConnections = async (): Promise<Connection[]> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/pending`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch pending connections');
  }
  return res.json();
};

// Get all accepted connections for the logged-in user
export const getAcceptedConnections = async (): Promise<Connection[]> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/accepted`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch accepted connections');
  }
  return res.json();
};

// Get all connections (both pending and accepted)
export const getAllConnections = async (): Promise<Connection[]> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch connections');
  }
  return res.json();
};

// Student requests connection to a teacher by code or ID
export const requestConnection = async (
  teacherId: string
): Promise<Connection> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ teacherId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to request connection');
  }
  return res.json();
};

// Teacher sends invite to student
export const sendInvite = async (studentId: string): Promise<Connection> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ studentId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to send invite');
  }
  return res.json();
};

// Student responds to invite (accept or reject)
export const respondToInvite = async (
  connectionId: string,
  action: 'accept' | 'reject'
): Promise<Connection> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/invite/${connectionId}/respond`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to respond to invite');
  }
  return res.json();
};

// Teacher removes a connection
export const removeConnection = async (connectionId: string): Promise<{ message: string }> => {
  const token = localStorage.getItem('sc_token');
  const res = await fetch(`${API_BASE}/connections/${connectionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to remove connection');
  }
  return res.json();
};
