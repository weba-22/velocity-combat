import { create } from 'zustand';

interface Effect {
  id: string;
  type: 'explosion' | 'nitro' | 'shield' | 'hit';
  position: [number, number, number];
  timestamp: number;
}

interface Projectile {
  id: string;
  type: 'missile' | 'mine';
  position: [number, number, number];
  rotation: [number, number, number];
}

interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'finished';
  score: number;
  speed: number;
  lap: number;
  totalLaps: number;
  powerUp: string | null;
  health: number;
  maxHealth: number;
  effects: Effect[];
  projectiles: Projectile[];
  shake: number;
  isShielded: boolean;
  weather: 'clear' | 'rain' | 'storm' | 'snow';
  time: number; // 0 to 24 (hours)
  user: any | null;
  setUser: (user: any | null) => void;
  setSpeed: (speed: number) => void;
  setScore: (score: number) => void;
  setLap: (lap: number) => void;
  setPowerUp: (powerUp: string | null) => void;
  setHealth: (health: number) => void;
  addEffect: (type: Effect['type'], position: [number, number, number]) => void;
  removeEffect: (id: string) => void;
  addProjectile: (type: Projectile['type'], position: [number, number, number], rotation: [number, number, number]) => void;
  removeProjectile: (id: string) => void;
  triggerShake: (intensity: number) => void;
  setShake: (shake: number) => void;
  setShielded: (active: boolean) => void;
  setWeather: (weather: 'clear' | 'rain' | 'storm' | 'snow') => void;
  setTime: (time: number) => void;
  startGame: () => void;
  finishGame: () => void;
  pauseGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  status: 'menu',
  score: 0,
  speed: 0,
  lap: 1,
  totalLaps: 3,
  powerUp: null,
  health: 100,
  maxHealth: 100,
  effects: [],
  projectiles: [],
  shake: 0,
  isShielded: false,
  weather: 'clear',
  time: 12,
  user: null,
  setUser: (user) => set({ user }),
  setSpeed: (speed) => set({ speed }),
  setScore: (score) => set((state) => ({ score: state.score + score })),
  setLap: (lap) => set({ lap }),
  setPowerUp: (powerUp) => set({ powerUp }),
  setHealth: (health) => set({ health: Math.max(0, Math.min(100, health)) }),
  addEffect: (type, position) => set((state) => ({
    effects: [...state.effects, { id: Math.random().toString(36), type, position, timestamp: Date.now() }]
  })),
  removeEffect: (id) => set((state) => ({
    effects: state.effects.filter((e) => e.id !== id)
  })),
  addProjectile: (type, position, rotation) => set((state) => ({
    projectiles: [...state.projectiles, { id: Math.random().toString(36), type, position, rotation }]
  })),
  removeProjectile: (id) => set((state) => ({
    projectiles: state.projectiles.filter((p) => p.id !== id)
  })),
  triggerShake: (intensity) => set({ shake: intensity }),
  setShake: (shake) => set({ shake }),
  setShielded: (isShielded) => set({ isShielded }),
  setWeather: (weather) => set({ weather }),
  setTime: (time) => set({ time }),
  startGame: () => set({ status: 'playing' }),
  finishGame: () => set({ status: 'finished' }),
  pauseGame: () => set((state) => ({ status: state.status === 'playing' ? 'paused' : 'playing' })),
  resetGame: () => set({ status: 'menu', score: 0, speed: 0, lap: 1, powerUp: null, health: 100, effects: [], projectiles: [], shake: 0, isShielded: false, weather: 'clear', time: 12 }),
}));
