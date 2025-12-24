const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/zombie';

export interface Survivor {
  id: number;
  name: string;
  health: number;
  hunger: number;
  morale: number;
  shelter: number;
  allies: number;
  day: number;
  score: number;
  status: 'alive' | 'dead' | 'escaped';
  createdAt: Date;
  decisions: Decision[];
}

export interface Decision {
  day: number;
  decision: string;
  result: string;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  days: number;
  survived: boolean;
  timestamp: Date;
}

export type DecisionType = 'shelter' | 'food' | 'allies' | 'rest';

// Create new survivor
export const createSurvivor = async (name: string): Promise<{ survivor: Survivor }> => {
  const response = await fetch(`${API_BASE}/survivors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return response.json();
};

// Make decision
export const makeDecision = async (
  survivorId: number,
  decision: DecisionType
): Promise<{ survivor: Survivor; message: string; scoreGain: number; zombieEvent: boolean }> => {
  const response = await fetch(`${API_BASE}/survivors/${survivorId}/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision })
  });
  return response.json();
};

// Get leaderboard
export const getLeaderboard = async (): Promise<{ leaderboard: LeaderboardEntry[]; total: number }> => {
  const response = await fetch(`${API_BASE}/leaderboard`);
  return response.json();
};

// Add to leaderboard
export const addToLeaderboard = async (entry: {
  name: string;
  score: number;
  days: number;
  survived: boolean;
}): Promise<{ entry: LeaderboardEntry }> => {
  const response = await fetch(`${API_BASE}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return response.json();
};