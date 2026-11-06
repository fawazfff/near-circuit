export type ScreenId = 'home' | 'race' | 'results' | 'academy' | 'market' | 'garage' | 'codex' | 'explorer';

export interface RaceResult {
  trackId: string;
  trackName: string;
  timeSeconds: number;
  distance: number;
  pickups: number;
  creditsEarned: number;
  xpEarned: number;
  medal: 'bronze' | 'silver' | 'gold';
  completedAt: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  credits: number;
  ownedItems: string[];
  equippedItems: string[];
  completedLessons: string[];
  bestTimes: Record<string, number>;
  raceResults: RaceResult[];
  lastSeenAt: string;
}

export interface Merchant {
  id: string;
  name: string;
  specialty: string;
  description: string;
  balance: number;
  targetBalance: number;
  inventory: Record<string, number>;
  targetInventory: Record<string, number>;
  basePrices: Record<string, number>;
  demand: Record<string, number>;
  isOpen: boolean;
  reputation: number;
  reason: string;
}

export interface MarketEvent {
  id: string;
  day: number;
  title: string;
  detail: string;
  kind: 'price' | 'stock' | 'business' | 'world';
}

export interface MarketState {
  day: number;
  merchants: Merchant[];
  events: MarketEvent[];
  lastSimulationAt?: string;
}

export interface GameSave {
  version: 1;
  profile: PlayerProfile;
  market: MarketState;
}

export interface TrackDefinition {
  id: string;
  name: string;
  region: string;
  subtitle: string;
  distance: number;
  difficulty: 'ROOKIE' | 'RISING' | 'PRO';
  reward: number;
  xp: number;
  accent: number;
  unlocked: boolean;
  terrainSeed: number;
  description: string;
}