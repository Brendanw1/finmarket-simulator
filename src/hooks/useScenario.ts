import { useState, useEffect } from 'react';
import { Scenario, ScenarioResult } from '../types';

export const useScenario = (scenarioId: string | null) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scenarioId) {
      setScenario(null);
      setLoading(false);
      return;
    }

    // Mock scenario data
    const mockScenario: Scenario = {
      id: scenarioId,
      title: 'Market Crash 2008',
      description: 'Navigate the 2008 financial crisis',
      difficulty: 'intermediate',
      category: 'crisis',
      initialCash: 100000,
      duration: 365,
      objectives: [],
      marketConditions: [],
      isActive: true,
      createdAt: new Date(),
    };

    setScenario(mockScenario);
    setLoading(false);
  }, [scenarioId]);

  const startScenario = () => {
    setIsPaused(false);
    setCurrentDay(0);
  };

  const pauseScenario = () => {
    setIsPaused(true);
  };

  const advanceDay = () => {
    if (!scenario || isPaused) return;
    setCurrentDay(prev => Math.min(prev + 1, scenario.duration));
  };

  const completeScenario = async (): Promise<ScenarioResult | null> => {
    if (!scenario) return null;

    // TODO: Calculate final results
    const result: ScenarioResult = {
      scenarioId: scenario.id,
      userId: 'user-id',
      finalValue: 0,
      returnPercent: 0,
      objectivesCompleted: 0,
      totalObjectives: scenario.objectives.length,
      trades: [],
      score: 0,
      feedback: '',
      completedAt: new Date(),
    };

    return result;
  };

  return {
    scenario,
    currentDay,
    isPaused,
    loading,
    startScenario,
    pauseScenario,
    advanceDay,
    completeScenario,
  };
};
