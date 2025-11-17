import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { GameState, Scenario, Portfolio, Asset, Trade, Position } from '../types';
import { generateMockAssets, applyMarketEvent, getAssetBySymbol, simulateMarketDay } from '../services/marketData';
import { updatePortfolio, saveTrade, createPortfolio } from '../services/firebase';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameState: GameState;
  assets: Asset[];
  trades: Trade[];
  startScenario: (scenario: Scenario) => Promise<void>;
  endScenario: () => void;
  executeTrade: (assetId: string, type: 'buy' | 'sell', quantity: number) => Promise<boolean>;
  advanceDay: () => void;
  setCurrentScenario: (scenario: Scenario | null) => void;
  setPortfolio: (portfolio: Portfolio | null) => void;
  setCurrentDay: (day: number) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: null,
    portfolio: null,
    currentDay: 0,
    isPaused: true,
    speed: 1,
  });

  const [assets, setAssets] = useState<Asset[]>(generateMockAssets());
  const [trades, setTrades] = useState<Trade[]>([]);

  // Simulate market day progression
  useEffect(() => {
    if (gameState.isPaused || !gameState.currentScenario) {
      return;
    }

    const interval = setInterval(() => {
      advanceDay();
    }, (5000 / gameState.speed)); // 5 seconds per day at speed 1

    return () => clearInterval(interval);
  }, [gameState.isPaused, gameState.speed, gameState.currentScenario]);

  const startScenario = async (scenario: Scenario) => {
    if (!user) {
      throw new Error('User must be logged in to start a scenario');
    }

    // Create a new portfolio for this scenario
    const newPortfolio = await createPortfolio(user.id, scenario.initialCash);

    setGameState({
      currentScenario: scenario,
      portfolio: newPortfolio,
      currentDay: 0,
      isPaused: true,
      speed: 1,
    });

    // Reset assets to initial state
    setAssets(generateMockAssets());
    setTrades([]);
  };

  const endScenario = () => {
    setGameState({
      currentScenario: null,
      portfolio: null,
      currentDay: 0,
      isPaused: true,
      speed: 1,
    });
    setTrades([]);
  };

  const executeTrade = useCallback(async (
    assetId: string,
    type: 'buy' | 'sell',
    quantity: number
  ): Promise<boolean> => {
    if (!gameState.portfolio || !gameState.currentScenario) {
      return false;
    }

    const asset = getAssetBySymbol(assets, assetId);
    if (!asset) {
      return false;
    }

    const total = asset.currentPrice * quantity;

    // Validate the trade
    if (type === 'buy') {
      if (gameState.portfolio.cash < total) {
        console.error('Insufficient cash for purchase');
        return false;
      }
    } else {
      // Check if we have enough quantity to sell
      const position = gameState.portfolio.positions.find(p => p.symbol === assetId);
      if (!position || position.quantity < quantity) {
        console.error('Insufficient quantity to sell');
        return false;
      }
    }

    // Create trade record
    const trade: Trade = {
      id: `trade-${Date.now()}`,
      portfolioId: gameState.portfolio.id,
      assetId: asset.id,
      symbol: asset.symbol,
      type,
      quantity,
      price: asset.currentPrice,
      total,
      timestamp: new Date(),
      status: 'executed',
    };

    // Update portfolio
    const updatedPortfolio = { ...gameState.portfolio };

    if (type === 'buy') {
      updatedPortfolio.cash -= total;

      // Add or update position
      const existingPosition = updatedPortfolio.positions.find(p => p.symbol === assetId);
      if (existingPosition) {
        const newQuantity = existingPosition.quantity + quantity;
        const newAveragePrice = (
          (existingPosition.averagePrice * existingPosition.quantity) +
          (asset.currentPrice * quantity)
        ) / newQuantity;

        existingPosition.quantity = newQuantity;
        existingPosition.averagePrice = newAveragePrice;
        existingPosition.currentPrice = asset.currentPrice;
        existingPosition.totalValue = newQuantity * asset.currentPrice;
        existingPosition.profitLoss = (asset.currentPrice - newAveragePrice) * newQuantity;
        existingPosition.profitLossPercent = ((asset.currentPrice - newAveragePrice) / newAveragePrice) * 100;
      } else {
        const newPosition: Position = {
          id: `pos-${Date.now()}`,
          assetId: asset.id,
          symbol: asset.symbol,
          quantity,
          averagePrice: asset.currentPrice,
          currentPrice: asset.currentPrice,
          totalValue: total,
          profitLoss: 0,
          profitLossPercent: 0,
        };
        updatedPortfolio.positions.push(newPosition);
      }
    } else {
      updatedPortfolio.cash += total;

      // Update or remove position
      const positionIndex = updatedPortfolio.positions.findIndex(p => p.symbol === assetId);
      if (positionIndex !== -1) {
        const position = updatedPortfolio.positions[positionIndex];
        position.quantity -= quantity;

        if (position.quantity <= 0) {
          updatedPortfolio.positions.splice(positionIndex, 1);
        } else {
          position.currentPrice = asset.currentPrice;
          position.totalValue = position.quantity * asset.currentPrice;
          position.profitLoss = (asset.currentPrice - position.averagePrice) * position.quantity;
          position.profitLossPercent = ((asset.currentPrice - position.averagePrice) / position.averagePrice) * 100;
        }
      }
    }

    // Recalculate total portfolio value
    const positionsValue = updatedPortfolio.positions.reduce((sum, p) => sum + p.totalValue, 0);
    updatedPortfolio.totalValue = updatedPortfolio.cash + positionsValue;

    // Add performance metric
    const initialValue = gameState.currentScenario.initialCash;
    const profitLoss = updatedPortfolio.totalValue - initialValue;
    const profitLossPercent = (profitLoss / initialValue) * 100;

    updatedPortfolio.performance.push({
      timestamp: new Date(),
      totalValue: updatedPortfolio.totalValue,
      profitLoss,
      profitLossPercent,
    });

    // Save to Firebase
    try {
      await updatePortfolio(updatedPortfolio.id, updatedPortfolio);
      await saveTrade(trade);

      // Update local state
      setGameState(prev => ({ ...prev, portfolio: updatedPortfolio }));
      setTrades(prev => [trade, ...prev]);

      return true;
    } catch (error) {
      console.error('Error saving trade:', error);
      return false;
    }
  }, [gameState.portfolio, gameState.currentScenario, assets]);

  const advanceDay = useCallback(() => {
    if (!gameState.currentScenario || !gameState.portfolio) {
      return;
    }

    const nextDay = gameState.currentDay + 1;

    // Check if scenario is complete
    if (nextDay > gameState.currentScenario.duration) {
      setGameState(prev => ({ ...prev, isPaused: true }));
      return;
    }

    // Check for market events on this day
    const todayEvents = gameState.currentScenario.marketConditions.filter(
      mc => mc.day === nextDay
    );

    let updatedAssets = [...assets];

    // Apply market events
    todayEvents.forEach(event => {
      updatedAssets = applyMarketEvent(updatedAssets, event);
    });

    // Simulate normal market movement
    updatedAssets = simulateMarketDay(updatedAssets);

    // Update portfolio positions with new prices
    if (gameState.portfolio.positions.length > 0) {
      const updatedPortfolio = { ...gameState.portfolio };
      let positionsValue = 0;

      updatedPortfolio.positions = updatedPortfolio.positions.map(position => {
        const asset = getAssetBySymbol(updatedAssets, position.symbol);
        if (asset) {
          const updatedPosition = {
            ...position,
            currentPrice: asset.currentPrice,
            totalValue: position.quantity * asset.currentPrice,
            profitLoss: (asset.currentPrice - position.averagePrice) * position.quantity,
            profitLossPercent: ((asset.currentPrice - position.averagePrice) / position.averagePrice) * 100,
          };
          positionsValue += updatedPosition.totalValue;
          return updatedPosition;
        }
        return position;
      });

      updatedPortfolio.totalValue = updatedPortfolio.cash + positionsValue;

      // Add performance metric
      const initialValue = gameState.currentScenario.initialCash;
      const profitLoss = updatedPortfolio.totalValue - initialValue;
      const profitLossPercent = (profitLoss / initialValue) * 100;

      updatedPortfolio.performance.push({
        timestamp: new Date(),
        totalValue: updatedPortfolio.totalValue,
        profitLoss,
        profitLossPercent,
      });

      // Save updated portfolio to Firebase
      updatePortfolio(updatedPortfolio.id, updatedPortfolio).catch(console.error);

      setGameState(prev => ({ ...prev, portfolio: updatedPortfolio, currentDay: nextDay }));
    } else {
      setGameState(prev => ({ ...prev, currentDay: nextDay }));
    }

    setAssets(updatedAssets);
  }, [gameState, assets]);

  const setCurrentScenario = (scenario: Scenario | null) => {
    setGameState(prev => ({ ...prev, currentScenario: scenario }));
  };

  const setPortfolio = (portfolio: Portfolio | null) => {
    setGameState(prev => ({ ...prev, portfolio }));
  };

  const setCurrentDay = (day: number) => {
    setGameState(prev => ({ ...prev, currentDay: day }));
  };

  const setPaused = (paused: boolean) => {
    setGameState(prev => ({ ...prev, isPaused: paused }));
  };

  const setSpeed = (speed: 1 | 2 | 5 | 10) => {
    setGameState(prev => ({ ...prev, speed }));
  };

  const resetGame = () => {
    setGameState({
      currentScenario: null,
      portfolio: null,
      currentDay: 0,
      isPaused: true,
      speed: 1,
    });
    setAssets(generateMockAssets());
    setTrades([]);
  };

  const value: GameContextType = {
    gameState,
    assets,
    trades,
    startScenario,
    endScenario,
    executeTrade,
    advanceDay,
    setCurrentScenario,
    setPortfolio,
    setCurrentDay,
    setPaused,
    setSpeed,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
