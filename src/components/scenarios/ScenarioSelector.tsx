import { useState } from 'react';
import { ScenarioCard } from './ScenarioCard';
import { Scenario } from '../../types';

export const ScenarioSelector = () => {
  const [scenarios] = useState<Scenario[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Select a Scenario</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Create Custom Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No scenarios available</p>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))
        )}
      </div>
    </div>
  );
};
