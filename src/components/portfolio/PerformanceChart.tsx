import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceMetric } from '../../types';

interface PerformanceChartProps {
  performance: PerformanceMetric[];
}

export const PerformanceChart = ({ performance }: PerformanceChartProps) => {
  const chartData = performance.map((metric) => ({
    date: new Date(metric.timestamp).toLocaleDateString(),
    value: metric.totalValue,
    profitLoss: metric.profitLoss,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Performance</h2>
      
      {chartData.length === 0 ? (
        <p className="text-gray-600 text-center py-12">No performance data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
