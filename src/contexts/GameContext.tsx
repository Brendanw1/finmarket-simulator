import { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, Scenario, Portfolio } from '../types';

interface GameContextType {
  gameState: GameState;
  setCurrentScenario: (scenario: Scenario | null) => void;
  setPortfolio: (portfolio: Portfolio | null) => void;
  setCurrentDay: (day: number) => void;
  setPaused: (paused: boolean) => void;
  setSpeed: (speed: 1 | 2 | 5 | 10) => void;
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
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: null,
    portfolio: null,
    currentDay: 0,
    isPaused: true,
    speed: 1,
  });

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

  const value: GameContextType = {
    gameState,
    setCurrentScenario,
    setPortfolio,
    setCurrentDay,
    setPaused,
    setSpeed,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
