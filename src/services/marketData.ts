import { Asset } from '../types';

// Mock market data generator
export const generateMockAssets = (): Asset[] => {
  const assets: Asset[] = [
    {
      id: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      currentPrice: 150.25,
      change24h: 2.5,
      volume: 50000000,
    },
    {
      id: '2',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      type: 'stock',
      currentPrice: 2800.50,
      change24h: -1.2,
      volume: 20000000,
    },
    {
      id: '3',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      type: 'stock',
      currentPrice: 725.75,
      change24h: 5.8,
      volume: 80000000,
    },
    {
      id: '4',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      currentPrice: 42000,
      change24h: -3.5,
      volume: 25000000000,
    },
    {
      id: '5',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      currentPrice: 2200,
      change24h: -2.1,
      volume: 12000000000,
    },
  ];

  return assets;
};

export const updateAssetPrice = (asset: Asset, volatility: number = 0.02): Asset => {
  const randomChange = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = asset.currentPrice * (1 + randomChange);
  const change24h = ((newPrice - asset.currentPrice) / asset.currentPrice) * 100;

  return {
    ...asset,
    currentPrice: newPrice,
    change24h,
  };
};

export const simulateMarketDay = (assets: Asset[]): Asset[] => {
  return assets.map(asset => updateAssetPrice(asset));
};

export const getHistoricalPrices = (
  asset: Asset,
  days: number
): Array<{ date: Date; price: number }> => {
  const prices: Array<{ date: Date; price: number }> = [];
  let currentPrice = asset.currentPrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    prices.push({
      date,
      price: currentPrice,
    });

    // Simulate price change
    const change = (Math.random() - 0.5) * 0.04;
    currentPrice = currentPrice * (1 + change);
  }

  return prices;
};
