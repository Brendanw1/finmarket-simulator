import { useState, useEffect } from 'react';
import { Sparkles, Loader, BookOpen } from 'lucide-react';
import { ScenarioCard } from './ScenarioCard';
import { Scenario } from '../../types';
import { generateScenario, getSuggestedTopics, hasCourseMaterials } from '../../services/claude';
import { saveScenario } from '../../services/firebase';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

export const ScenarioSelector = () => {
  const { user } = useAuth();
  const { startScenario } = useGame();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [hasMaterials, setHasMaterials] = useState(false);

  useEffect(() => {
    loadSuggestedTopics();
    setHasMaterials(hasCourseMaterials());
  }, []);

  const loadSuggestedTopics = async () => {
    try {
      const topics = await getSuggestedTopics();
      setSuggestedTopics(topics);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const handleGenerateScenario = async () => {
    if (!selectedTopic || !user) return;

    setGenerating(true);

    try {
      const scenario = await generateScenario(selectedTopic, selectedDifficulty);

      if (scenario) {
        // Save to Firebase
        const scenarioId = await saveScenario(scenario);
        scenario.id = scenarioId;

        // Add to scenarios list
        setScenarios(prev => [scenario, ...prev]);

        // Reset selection
        setSelectedTopic('');
      }
    } catch (error) {
      console.error('Error generating scenario:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectScenario = async (scenario: Scenario) => {
    setLoading(true);
    try {
      await startScenario(scenario);
      // Naviation will be handled by App routing
    } catch (error) {
      console.error('Error starting scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Course Materials Warning */}
      {!hasMaterials && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">No Course Materials Uploaded</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Upload your course materials to get scenarios tailored to your specific class content.
              You can still generate generic scenarios below.
            </p>
          </div>
        </div>
      )}

      {/* Scenario Generator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Generate New Scenario</h2>
        </div>

        <p className="text-gray-600 mb-6">
          {hasMaterials
            ? 'Choose a topic from your course materials to create a customized scenario.'
            : 'Choose a topic to create a financial markets scenario.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Topic Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={generating}
            >
              <option value="">Select a topic...</option>
              {suggestedTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as typeof selectedDifficulty)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={generating}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateScenario}
          disabled={!selectedTopic || generating}
          className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Scenario...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Scenario
            </>
          )}
        </button>
      </div>

      {/* Scenarios List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Scenarios</h3>

        {scenarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No scenarios yet</p>
            <p className="text-gray-500 text-sm">
              Generate your first scenario using the form above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onSelect={handleSelectScenario}
              />
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex items-center gap-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-lg font-medium">Starting scenario...</span>
          </div>
        </div>
      )}
    </div>
  );
};
