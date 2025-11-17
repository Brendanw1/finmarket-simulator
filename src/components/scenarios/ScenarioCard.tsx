import { Scenario } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect?: (scenario: Scenario) => void;
}

export const ScenarioCard = ({ scenario, onSelect }: ScenarioCardProps) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              difficultyColors[scenario.difficulty]
            }`}
          >
            {scenario.difficulty}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {scenario.description}
        </p>

        <div className="space-y-2 text-sm text-gray-700 mb-4">
          <div className="flex justify-between">
            <span>Initial Cash:</span>
            <span className="font-medium">{formatCurrency(scenario.initialCash)}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{scenario.duration} days</span>
          </div>
          <div className="flex justify-between">
            <span>Objectives:</span>
            <span className="font-medium">{scenario.objectives.length}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect?.(scenario)}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Start Scenario
        </button>
      </div>
    </div>
  );
};
