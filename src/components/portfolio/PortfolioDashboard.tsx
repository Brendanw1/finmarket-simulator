import { PerformanceChart } from './PerformanceChart';
import { AssetAllocation } from './AssetAllocation';
import { Portfolio } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface PortfolioDashboardProps {
  portfolio: Portfolio | null;
}

export const PortfolioDashboard = ({ portfolio }: PortfolioDashboardProps) => {
  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No portfolio data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(portfolio.totalValue)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Cash</h3>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(portfolio.cash)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Positions</h3>
          <p className="text-3xl font-bold text-gray-900">
            {portfolio.positions.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart performance={portfolio.performance} />
        <AssetAllocation positions={portfolio.positions} />
      </div>
    </div>
  );
};
