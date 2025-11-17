import { useState } from 'react';
import { analyzeDocument, getMarketAdvice } from '../services/claude';
import { ClaudeAnalysis } from '../types';

export const useClaude = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocumentContent = async (content: string): Promise<ClaudeAnalysis | null> => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeDocument(content);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze document';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAdvice = async (portfolioData: string, marketConditions: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const advice = await getMarketAdvice(portfolioData, marketConditions);
      return advice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get advice';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    analyzeDocumentContent,
    getAdvice,
  };
};
