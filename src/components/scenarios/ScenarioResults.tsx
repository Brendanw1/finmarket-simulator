import { ScenarioResult } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface ScenarioResultsProps {
  result: ScenarioResult;
  onRestart?: () => void;
  onContinue?: () => void;
}

export const ScenarioResults = ({ result, onRestart, onContinue }: ScenarioResultsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Scenario Complete!
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Final Value</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(result.finalValue)}
          </p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Return</p>
          <p
            className={`text-2xl font-bold ${
              result.returnPercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatPercent(result.returnPercent)}
          </p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Objectives Completed</p>
          <p className="text-2xl font-bold text-gray-900">
            {result.objectivesCompleted} / {result.totalObjectives}
          </p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Score</p>
          <p className="text-2xl font-bold text-blue-600">{result.score}</p>
        </div>
      </div>

      {result.feedback && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
          <p className="text-gray-700">{result.feedback}</p>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={onRestart}
          className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
        >
          Try Again
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Next Scenario
        </button>
      </div>
    </div>
  );
};
