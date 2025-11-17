import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, BookOpen, Lightbulb, Loader, CheckCircle, XCircle } from 'lucide-react';
import { ScenarioResult, Scenario, Trade } from '../../types';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { evaluateTradingDecisions } from '../../services/claude';

interface ScenarioResultsProps {
  scenario: Scenario;
  trades: Trade[];
  finalValue: number;
  initialValue: number;
  onRestart?: () => void;
  onContinue?: () => void;
}

export const ScenarioResults = ({
  scenario,
  trades,
  finalValue,
  initialValue,
  onRestart,
  onContinue,
}: ScenarioResultsProps) => {
  const [evaluating, setEvaluating] = useState(true);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    conceptsApplied: string[];
    conceptsMissed: string[];
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    evaluatePerformance();
  }, []);

  const evaluatePerformance = async () => {
    setEvaluating(true);

    try {
      const result = await evaluateTradingDecisions(scenario, trades, finalValue, initialValue);
      setEvaluation(result);
    } catch (error) {
      console.error('Error evaluating performance:', error);
      // Provide fallback evaluation
      setEvaluation({
        score: 50,
        feedback: 'Unable to generate detailed feedback at this time.',
        conceptsApplied: [],
        conceptsMissed: [],
        suggestions: [],
      });
    } finally {
      setEvaluating(false);
    }
  };

  const returnPercent = ((finalValue - initialValue) / initialValue) * 100;
  const objectivesCompleted = scenario.objectives.filter(obj => obj.achieved).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Scenario Complete!</h1>
        </div>
        <p className="text-center text-blue-100 text-lg">{scenario.title}</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            {returnPercent >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <h3 className="text-sm font-medium text-gray-600">Return</h3>
          </div>
          <p className={`text-3xl font-bold ${returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(returnPercent)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Final Value</h3>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(finalValue)}</p>
          <p className="text-sm text-gray-500 mt-1">from {formatCurrency(initialValue)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Objectives</h3>
          <p className="text-3xl font-bold text-blue-600">
            {objectivesCompleted}/{scenario.objectives.length}
          </p>
          <p className="text-sm text-gray-500 mt-1">completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Score</h3>
          {evaluating ? (
            <div className="flex items-center gap-2">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Calculating...</span>
            </div>
          ) : (
            <p className="text-3xl font-bold text-purple-600">{evaluation?.score}/100</p>
          )}
        </div>
      </div>

      {/* AI Evaluation */}
      {evaluating ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyzing Your Trading Decisions...
          </h3>
          <p className="text-gray-600">
            Claude is evaluating your performance based on course concepts
          </p>
        </div>
      ) : evaluation && (
        <>
          {/* Main Feedback */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Educational Feedback</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{evaluation.feedback}</p>
          </div>

          {/* Concepts Applied */}
          {evaluation.conceptsApplied.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Concepts Applied Correctly</h3>
              </div>
              <ul className="space-y-2">
                {evaluation.conceptsApplied.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concepts Missed */}
          {evaluation.conceptsMissed.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Concepts to Review</h3>
              </div>
              <ul className="space-y-2">
                {evaluation.conceptsMissed.map((concept, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {evaluation.suggestions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Suggestions for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {evaluation.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Trading History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Symbol</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Quantity</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Price</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-100">
                  <td className="py-2 text-sm text-gray-700">
                    {trade.timestamp.toLocaleString()}
                  </td>
                  <td className="py-2">
                    <span className={`text-sm font-medium ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 text-sm font-medium text-gray-900">{trade.symbol}</td>
                  <td className="py-2 text-sm text-gray-700 text-right">{trade.quantity}</td>
                  <td className="py-2 text-sm text-gray-700 text-right">
                    {formatCurrency(trade.price)}
                  </td>
                  <td className="py-2 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(trade.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onRestart}
          className="flex-1 py-4 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold text-lg"
        >
          Try This Scenario Again
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold text-lg"
        >
          Try New Scenario
        </button>
      </div>
    </div>
  );
};
