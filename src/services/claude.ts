import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysis } from '../types';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

let client: Anthropic | null = null;

export const getClaudeClient = (): Anthropic => {
  if (!client && apiKey) {
    client = new Anthropic({
      apiKey,
      // Note: In production, use a backend proxy instead of browser-side API calls
    } as Anthropic);
  }
  if (!client) {
    throw new Error('Anthropic API key not configured');
  }
  return client;
};

export const analyzeDocument = async (content: string): Promise<ClaudeAnalysis> => {
  const claude = getClaudeClient();
  
  const message = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this financial document and provide insights: ${content}`,
      },
    ],
  });

  // Parse the response into structured analysis
  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  
  return {
    summary: text,
    keyInsights: [],
    recommendations: [],
    riskAssessment: {
      level: 'medium',
      factors: [],
    },
  };
};

export const getMarketAdvice = async (
  portfolioData: string,
  marketConditions: string
): Promise<string> => {
  const claude = getClaudeClient();
  
  const message = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Given this portfolio: ${portfolioData} and market conditions: ${marketConditions}, provide trading advice.`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
};
