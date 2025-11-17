// Core data types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'crypto' | 'commodity' | 'forex';
  currentPrice: number;
  change24h: number;
  volume: number;
}

export interface Position {
  id: string;
  assetId: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  cash: number;
  totalValue: number;
  positions: Position[];
  performance: PerformanceMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceMetric {
  timestamp: Date;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Trade {
  id: string;
  portfolioId: string;
  assetId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
}

export interface Order {
  id: string;
  portfolioId: string;
  assetId: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'active' | 'filled' | 'cancelled';
  createdAt: Date;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'crisis' | 'growth' | 'volatility' | 'event-driven' | 'custom';
  initialCash: number;
  duration: number; // in days
  objectives: ScenarioObjective[];
  marketConditions: MarketCondition[];
  isActive: boolean;
  createdAt: Date;
}

export interface ScenarioObjective {
  id: string;
  description: string;
  type: 'return' | 'risk' | 'holdings' | 'trades';
  target: number;
  achieved: boolean;
}

export interface MarketCondition {
  day: number;
  eventType: 'news' | 'economic' | 'political' | 'technical';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  affectedAssets: string[];
}

export interface ScenarioResult {
  scenarioId: string;
  userId: string;
  finalValue: number;
  returnPercent: number;
  objectivesCompleted: number;
  totalObjectives: number;
  trades: Trade[];
  score: number;
  feedback: string;
  completedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface GameState {
  currentScenario: Scenario | null;
  portfolio: Portfolio | null;
  currentDay: number;
  isPaused: boolean;
  speed: 1 | 2 | 5 | 10;
}

export interface UploadedMaterial {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  content: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
}

export interface ClaudeAnalysis {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
}
