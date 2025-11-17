import { Position } from '../../types';

export const PositionsList = () => {
  const positions: Position[] = [];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Your Positions</h2>
      
      {positions.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No open positions</p>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <div
              key={position.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{position.symbol}</h3>
                  <p className="text-sm text-gray-600">
                    {position.quantity} shares @ ${position.averagePrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${position.totalValue.toFixed(2)}</p>
                  <p
                    className={`text-sm ${
                      position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {position.profitLoss >= 0 ? '+' : ''}
                    {position.profitLoss.toFixed(2)} ({position.profitLossPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
