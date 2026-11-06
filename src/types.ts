export type TokenId = 'item_nos' | 'item_slicks' | 'item_turbo' | 'share_marcus' | 'share_elena' | 'share_dex';

export interface NEP245Item {
  id: TokenId;
  name: string;
  category: 'consumable' | 'upgrade' | 'syndicate_share';
  description: string;
  durabilityCostPerRace?: number;
  effect: string;
}

export interface MerchantReasoning {
  headline: string;
  inventoryRatio: number;
  demandFactor: number;
  cashReserveStatus: 'healthy' | 'warning' | 'critical' | 'bankrupt';
  explanation: string;
  lastPriceAdjustmentPercent: number;
}

export interface NPCMerchant {
  id: string;
  name: string;
  callsign: string;
  specialty: string;
  nearAccountId: string;
  walletBalanceNear: number;
  bankrupt: boolean;
  bailoutCostNear: number;
  playerEquityPercent: number; // percentage of dividends owned by player
  primaryItemId: TokenId;
  primaryItemName: string;
  basePrice: number;
  currentPrice: number;
  inventoryCount: number;
  maxInventory: number;
  recentSalesVolume: number;
  reasoning: MerchantReasoning;
}

export interface PlayerState {
  nearAccountId: string;
  sessionKey: string;
  nearBalance: number;
  inventory: Record<TokenId, number>;
  car: {
    name: string;
    topSpeed: number;
    acceleration: number;
    handling: number;
    nosLevel: number; // 0 - 100
    tireGrip: number; // 0 - 100
    installedTurbo: boolean;
  };
  stats: {
    racesCompleted: number;
    racesWon: number;
    totalEarnedNear: number;
    totalSpentNear: number;
  };
}

export interface EconomyHistoryPoint {
  day: number;
  nosPrice: number;
  tiresPrice: number;
  turboPrice: number;
  totalMarketVolume: number;
  marcusBalance: number;
  elenaBalance: number;
  dexBalance: number;
}

export interface AcademyLesson {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  racingAnalogy: string;
  nearConcept: string;
  interactiveDemo: {
    prompt: string;
    actionLabel: string;
    resultText: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}
