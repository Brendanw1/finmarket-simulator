import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Asset } from '../../types';
import { useGame } from '../../contexts/GameContext';
import { formatCurrency, formatPercent } from '../../lib/utils';

export const TradingInterface = () => {
  const { assets, gameState, executeTrade } = useGame();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');

  const handleTrade = async () => {
    if (!selectedAsset || !gameState.portfolio) return;

    setError('');
    setExecuting(true);

    try {
      const success = await executeTrade(selectedAsset.symbol, tradeType, quantity);

      if (success) {
        setQuantity(1);
        setSelectedAsset(null);
      } else {
        setError('Trade failed. Check your cash/holdings.');
      }
    } catch (err) {
      setError('Error executing trade');
    } finally {
      setExecuting(false);
    }
  };

  const calculateTotal = () => {
    if (!selectedAsset) return 0;
    return selectedAsset.currentPrice * quantity;
  };

  const canExecuteTrade = () => {
    if (!selectedAsset || !gameState.portfolio) return false;

    if (tradeType === 'buy') {
      return gameState.portfolio.cash >= calculateTotal();
    } else {
      const position = gameState.portfolio.positions.find(p => p.symbol === selectedAsset.symbol);
      return position && position.quantity >= quantity;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Market Data - Main Panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Market</h2>

          {!gameState.currentScenario ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No active scenario. Start a scenario to begin trading.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedAsset?.id === asset.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-left">{asset.symbol}</h3>
                        <p className="text-sm text-gray-500 text-left">{asset.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(asset.currentPrice)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatPercent(asset.change24h)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trading Panel - Sidebar */}
      <div className="space-y-6">
        {/* Order Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Place Order</h3>

          {!selectedAsset ? (
            <p className="text-gray-500 text-center py-8">Select an asset to trade</p>
          ) : (
            <div className="space-y-4">
              {/* Asset Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{selectedAsset.symbol}</h4>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(selectedAsset.currentPrice)}
                </p>
              </div>

              {/* Trade Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`py-2 px-4 rounded-lg font-medium ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`py-2 px-4 rounded-lg font-medium ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sell
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Total */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={handleTrade}
                disabled={!canExecuteTrade() || executing}
                className={`w-full py-3 px-4 rounded-lg font-semibold ${
                  tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {executing ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedAsset.symbol}`}
              </button>
            </div>
          )}
        </div>

        {/* Portfolio Summary */}
        {gameState.portfolio && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Portfolio Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cash:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(gameState.portfolio.cash)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(gameState.portfolio.totalValue)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Positions:</span>
                <span className="font-semibold text-gray-900">
                  {gameState.portfolio.positions.length}
                </span>
              </div>
            </div>

            {/* Current Positions */}
            {gameState.portfolio.positions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Positions</h4>
                <div className="space-y-2">
                  {gameState.portfolio.positions.map((position) => (
                    <div key={position.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{position.symbol}</span>
                      <span className="font-medium text-gray-900">{position.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
