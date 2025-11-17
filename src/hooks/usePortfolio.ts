import { useState, useEffect } from 'react';
import { Portfolio, Position, Trade } from '../types';

export const usePortfolio = (userId: string | null) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPortfolio(null);
      setLoading(false);
      return;
    }

    // Mock portfolio data
    const mockPortfolio: Portfolio = {
      id: '1',
      userId,
      cash: 10000,
      totalValue: 10000,
      positions: [],
      performance: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPortfolio(mockPortfolio);
    setLoading(false);
  }, [userId]);

  const executeTrade = async (trade: Omit<Trade, 'id' | 'timestamp' | 'status'>) => {
    // TODO: Implement trade execution logic
    console.log('Executing trade:', trade);
  };

  const updatePosition = (position: Position) => {
    if (!portfolio) return;
    
    const updatedPositions = portfolio.positions.map(p =>
      p.id === position.id ? position : p
    );
    
    setPortfolio({
      ...portfolio,
      positions: updatedPositions,
      updatedAt: new Date(),
    });
  };

  return {
    portfolio,
    loading,
    error,
    executeTrade,
    updatePosition,
  };
};
