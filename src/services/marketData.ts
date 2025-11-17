import { Asset, MarketCondition } from '../types';

// Mock market data generator with enhanced features
export const generateMockAssets = (): Asset[] => {
  const assets: Asset[] = [
    // Stocks
    {
      id: 'AAPL',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      currentPrice: 150.25,
      change24h: 2.5,
      volume: 50000000,
    },
    {
      id: 'GOOGL',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      type: 'stock',
      currentPrice: 2800.50,
      change24h: -1.2,
      volume: 20000000,
    },
    {
      id: 'TSLA',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      type: 'stock',
      currentPrice: 725.75,
      change24h: 5.8,
      volume: 80000000,
    },
    {
      id: 'MSFT',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      type: 'stock',
      currentPrice: 380.45,
      change24h: 1.3,
      volume: 35000000,
    },
    {
      id: 'JPM',
      symbol: 'JPM',
      name: 'JPMorgan Chase',
      type: 'stock',
      currentPrice: 145.20,
      change24h: -0.8,
      volume: 15000000,
    },
    // Bonds
    {
      id: 'US10Y',
      symbol: 'US10Y',
      name: 'US 10-Year Treasury',
      type: 'bond',
      currentPrice: 98.50,
      change24h: -0.2,
      volume: 5000000,
    },
    {
      id: 'CORP-AAA',
      symbol: 'CORP-AAA',
      name: 'AAA Corporate Bond',
      type: 'bond',
      currentPrice: 102.30,
      change24h: 0.1,
      volume: 2000000,
    },
    // Crypto
    {
      id: 'BTC',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      currentPrice: 42000,
      change24h: -3.5,
      volume: 25000000000,
    },
    {
      id: 'ETH',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      currentPrice: 2200,
      change24h: -2.1,
      volume: 12000000000,
    },
    // Commodities
    {
      id: 'GOLD',
      symbol: 'GOLD',
      name: 'Gold',
      type: 'commodity',
      currentPrice: 1950.50,
      change24h: 0.5,
      volume: 8000000,
    },
    {
      id: 'OIL',
      symbol: 'OIL',
      name: 'Crude Oil',
      type: 'commodity',
      currentPrice: 82.40,
      change24h: 2.1,
      volume: 15000000,
    },
  ];

  return assets;
};

export const updateAssetPrice = (
  asset: Asset,
  volatility: number = 0.02,
  trend: number = 0
): Asset => {
  // Combine random volatility with an optional trend
  const randomChange = (Math.random() - 0.5) * 2 * volatility;
  const totalChange = randomChange + trend;
  const newPrice = asset.currentPrice * (1 + totalChange);
  const change24h = ((newPrice - asset.currentPrice) / asset.currentPrice) * 100;

  // Update volume with some randomness
  const volumeChange = (Math.random() - 0.5) * 0.3;
  const newVolume = asset.volume * (1 + volumeChange);

  return {
    ...asset,
    currentPrice: newPrice,
    change24h,
    volume: Math.floor(newVolume),
  };
};

export const simulateMarketDay = (
  assets: Asset[],
  volatilityMultiplier: number = 1
): Asset[] => {
  return assets.map(asset => {
    // Different asset types have different base volatility
    let baseVolatility = 0.02;
    if (asset.type === 'crypto') baseVolatility = 0.05;
    if (asset.type === 'bond') baseVolatility = 0.005;
    if (asset.type === 'commodity') baseVolatility = 0.03;

    return updateAssetPrice(asset, baseVolatility * volatilityMultiplier);
  });
};

export const applyMarketEvent = (
  assets: Asset[],
  condition: MarketCondition
): Asset[] => {
  return assets.map(asset => {
    // Check if this asset is affected by the event
    const isAffected = condition.affectedAssets.includes(asset.symbol) ||
                       condition.affectedAssets.includes('ALL');

    if (!isAffected) {
      return asset;
    }

    // Determine the impact magnitude based on event type and impact
    let impactMagnitude = 0;

    switch (condition.impact) {
      case 'positive':
        impactMagnitude = 0.03 + Math.random() * 0.05; // 3-8% positive
        break;
      case 'negative':
        impactMagnitude = -(0.03 + Math.random() * 0.05); // 3-8% negative
        break;
      case 'neutral':
        impactMagnitude = (Math.random() - 0.5) * 0.02; // -1% to 1%
        break;
    }

    // Economic events have bigger impact
    if (condition.eventType === 'economic') {
      impactMagnitude *= 1.5;
    }

    // Apply the impact
    const volatility = Math.abs(impactMagnitude) / 2;
    return updateAssetPrice(asset, volatility, impactMagnitude);
  });
};

export const getHistoricalPrices = (
  asset: Asset,
  days: number,
  volatilityMultiplier: number = 1
): Array<{ date: Date; price: number; volume: number }> => {
  const prices: Array<{ date: Date; price: number; volume: number }> = [];

  // Start from a price that will end up at the current price
  let currentPrice = asset.currentPrice / (1 + ((Math.random() - 0.5) * 0.1));
  let currentVolume = asset.volume;

  // Different asset types have different base volatility
  let baseVolatility = 0.02;
  if (asset.type === 'crypto') baseVolatility = 0.05;
  if (asset.type === 'bond') baseVolatility = 0.005;
  if (asset.type === 'commodity') baseVolatility = 0.03;

  const volatility = baseVolatility * volatilityMultiplier;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    prices.push({
      date,
      price: currentPrice,
      volume: currentVolume,
    });

    // Simulate price change for next day
    const change = (Math.random() - 0.5) * 2 * volatility;
    currentPrice = currentPrice * (1 + change);

    // Simulate volume change
    const volumeChange = (Math.random() - 0.5) * 0.3;
    currentVolume = currentVolume * (1 + volumeChange);
  }

  return prices;
};

export const getAssetBySymbol = (assets: Asset[], symbol: string): Asset | undefined => {
  return assets.find(a => a.symbol === symbol);
};

export const calculatePortfolioValue = (
  positions: Array<{ symbol: string; quantity: number }>,
  assets: Asset[]
): number => {
  return positions.reduce((total, position) => {
    const asset = getAssetBySymbol(assets, position.symbol);
    if (asset) {
      return total + (asset.currentPrice * position.quantity);
    }
    return total;
  }, 0);
};

// Generate realistic market events based on scenario conditions
export const generateMarketEvents = (
  duration: number,
  category: string
): MarketCondition[] => {
  const events: MarketCondition[] = [];

  if (category === 'crisis') {
    // Add crisis events - major market disruptions
    events.push({
      day: 1,
      eventType: 'economic',
      description: 'Federal Reserve announces unexpected interest rate hike of 0.75%',
      impact: 'negative',
      affectedAssets: ['ALL'],
    });
    events.push({
      day: Math.floor(duration / 2),
      eventType: 'political',
      description: 'Geopolitical tensions escalate, affecting global markets',
      impact: 'negative',
      affectedAssets: ['AAPL', 'GOOGL', 'MSFT', 'OIL'],
    });
  } else if (category === 'growth') {
    // Add growth events - positive market conditions
    events.push({
      day: 2,
      eventType: 'economic',
      description: 'Strong GDP growth reported, exceeding expectations',
      impact: 'positive',
      affectedAssets: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
    });
    events.push({
      day: Math.floor(duration * 0.7),
      eventType: 'news',
      description: 'Technology sector sees breakthrough innovation announcements',
      impact: 'positive',
      affectedAssets: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
    });
  } else if (category === 'volatility') {
    // Add high volatility events
    events.push({
      day: 3,
      eventType: 'economic',
      description: 'Unexpected inflation data creates market uncertainty',
      impact: 'negative',
      affectedAssets: ['US10Y', 'CORP-AAA', 'GOLD'],
    });
    events.push({
      day: Math.floor(duration / 2),
      eventType: 'news',
      description: 'Major tech earnings beat expectations',
      impact: 'positive',
      affectedAssets: ['AAPL', 'GOOGL', 'MSFT'],
    });
    events.push({
      day: Math.floor(duration * 0.8),
      eventType: 'technical',
      description: 'Crypto market experiences sharp correction',
      impact: 'negative',
      affectedAssets: ['BTC', 'ETH'],
    });
  } else if (category === 'event-driven') {
    // Add specific event-driven scenarios
    events.push({
      day: 1,
      eventType: 'news',
      description: 'Major merger announcement in tech sector',
      impact: 'positive',
      affectedAssets: ['AAPL', 'GOOGL'],
    });
    events.push({
      day: Math.floor(duration * 0.4),
      eventType: 'political',
      description: 'New regulations proposed for financial sector',
      impact: 'negative',
      affectedAssets: ['JPM', 'CORP-AAA'],
    });
  }

  return events;
};

// Simulate realistic intraday price movements
export const simulateIntradayPrices = (
  asset: Asset,
  hours: number = 24
): Array<{ time: Date; price: number }> => {
  const prices: Array<{ time: Date; price: number }> = [];
  let currentPrice = asset.currentPrice;

  // Intraday volatility is lower than daily
  const intradayVolatility = asset.type === 'crypto' ? 0.01 : 0.005;

  for (let i = 0; i < hours; i++) {
    const time = new Date();
    time.setHours(time.getHours() - (hours - i));

    prices.push({
      time,
      price: currentPrice,
    });

    // Simulate small price movements
    const change = (Math.random() - 0.5) * 2 * intradayVolatility;
    currentPrice = currentPrice * (1 + change);
  }

  return prices;
};
