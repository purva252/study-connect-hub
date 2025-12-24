import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  createSurvivor,
  makeDecision,
  getLeaderboard,
  addToLeaderboard,
  Survivor,
  LeaderboardEntry,
  DecisionType
} from '@/services/zombieApi';

type GameState = 'menu' | 'playing' | 'gameover';

export default function ZombieGame() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [survivor, setSurvivor] = useState<Survivor | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nameInput, setNameInput] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const startGame = async () => {
    if (!nameInput.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your survivor name",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const data = await createSurvivor(nameInput);
      setSurvivor(data.survivor);
      setGameState('playing');
      toast({
        title: "Game Started!",
        description: `Welcome, ${data.survivor.name}. Survive 14 days to escape!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: DecisionType) => {
    if (!survivor) return;

    try {
      setLoading(true);
      const data = await makeDecision(survivor.id, decision);
      setSurvivor(data.survivor);

      toast({
        title: `Day ${data.survivor.day}`,
        description: data.message,
        variant: data.zombieEvent ? "destructive" : "default"
      });

      if (data.survivor.status === 'dead') {
        await handleGameOver(false);
      } else if (data.survivor.status === 'escaped') {
        await handleGameOver(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make decision",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGameOver = async (survived: boolean) => {
    if (!survivor) return;

    try {
      await addToLeaderboard({
        name: survivor.name,
        score: survivor.score,
        days: survivor.day,
        survived
      });
      setGameState('gameover');
    } catch (error) {
      console.error('Failed to add to leaderboard:', error);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setSurvivor(null);
    setNameInput('');
    fetchLeaderboard();
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 flex items-center justify-center p-5">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-7xl font-black text-red-500 tracking-wider leading-tight">
                🧟 ZOMBIE<br />APOCALYPSE
              </h1>
              <p className="text-3xl font-bold text-amber-500 tracking-widest">
                REST API SURVIVAL GAME
              </p>
            </div>

            <Card className="bg-gray-900/90 border-red-500">
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="Enter your name..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                  className="bg-gray-950/80 border-gray-700 text-white"
                />
                <Button
                  onClick={startGame}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700"
                  size="lg"
                >
                  {loading ? 'STARTING...' : 'START GAME'}
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="w-full"
                >
                  ← Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {leaderboard.length > 0 && (
            <Card className="bg-gray-900/90 border-amber-500">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-amber-500">
                  🏆 LEADERBOARD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-3 border-b border-amber-500/20 text-gray-300"
                    >
                      <span className="font-semibold">
                        {i + 1}. {entry.name}
                      </span>
                      <span className="text-amber-500 font-bold">
                        {entry.score} pts ({entry.days}d)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'gameover' && survivor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 flex items-center justify-center p-5">
        <Card className="bg-gray-900/90 border-red-500 max-w-md">
          <CardHeader>
            <CardTitle className="text-6xl font-black text-center">
              {survivor.status === 'escaped' ? '✨ ESCAPED!' : '💀 DEAD'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-2xl text-gray-300">
                Score: <strong className="text-amber-500">{survivor.score}</strong>
              </p>
              <p className="text-2xl text-gray-300">
                Days: <strong className="text-amber-500">{survivor.day}</strong>
              </p>
            </div>
            <Button
              onClick={resetGame}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700"
              size="lg"
            >
              PLAY AGAIN
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!survivor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-7xl font-black text-red-500">DAY {survivor.day}</h1>
            <p className="text-2xl text-amber-500 font-bold">Survivor: {survivor.name}</p>
          </div>
          <Button onClick={() => navigate(-1)} variant="outline">
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {[
            { icon: '❤️', label: 'Health', value: Math.max(0, survivor.health) },
            { icon: '🍖', label: 'Hunger', value: Math.max(0, survivor.hunger) },
            { icon: '😊', label: 'Morale', value: Math.max(0, survivor.morale) },
            { icon: '🏠', label: 'Shelter', value: Math.max(0, survivor.shelter) },
            { icon: '👥', label: 'Allies', value: survivor.allies * 20 },
          ].map((stat, i) => (
            <Card key={i} className="bg-gray-900/80 border-gray-700 hover:border-red-500 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-xs text-gray-400 mb-2 uppercase">{stat.label}</div>
                <div className="text-4xl font-extrabold text-amber-500">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <DecisionButton
            onClick={() => handleDecision('shelter')}
            icon="🏠"
            title="Build Shelter"
            desc="Costs hunger, +30 safety"
            disabled={loading}
          />
          <DecisionButton
            onClick={() => handleDecision('food')}
            icon="🍖"
            title="Hunt Food"
            desc="Risky, restores hunger"
            disabled={loading}
          />
          <DecisionButton
            onClick={() => handleDecision('allies')}
            icon="👥"
            title="Find Allies"
            desc="Meet survivors, +morale"
            disabled={loading}
          />
          <DecisionButton
            onClick={() => handleDecision('rest')}
            icon="😴"
            title="Rest"
            desc="Heal, safe choice"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}

interface DecisionButtonProps {
  onClick: () => void;
  icon: string;
  title: string;
  desc: string;
  disabled: boolean;
}

function DecisionButton({ onClick, icon, title, desc, disabled }: DecisionButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="relative overflow-hidden bg-gray-900/85 border-2 border-red-700 hover:border-red-500 h-auto p-8 flex flex-col items-center gap-4"
      variant="outline"
    >
      <div className="text-6xl">{icon}</div>
      <div className="text-xl font-bold">{title}</div>
      <div className="text-sm text-gray-400">{desc}</div>
    </Button>
  );
}