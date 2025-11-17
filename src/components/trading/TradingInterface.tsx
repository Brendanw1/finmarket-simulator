import { useState } from 'react';
import { OrderPanel } from './OrderPanel';
import { PositionsList } from './PositionsList';
import { Asset } from '../../types';

export const TradingInterface = () => {
  const [selectedAsset] = useState<Asset | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Market Data</h2>
          <p className="text-gray-600">Asset list and charts will be displayed here</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <OrderPanel selectedAsset={selectedAsset} />
        <PositionsList />
      </div>
    </div>
  );
};
