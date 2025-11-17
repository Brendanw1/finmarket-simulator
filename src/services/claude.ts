import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysis, Trade, Scenario } from '../types';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

let client: Anthropic | null = null;

// Conversation history for maintaining context across the session
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }>;
}

let conversationHistory: ConversationMessage[] = [];
let courseMaterialsContext: string = '';

export const getClaudeClient = (): Anthropic => {
  if (!client && apiKey) {
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
    });
  }
  if (!client) {
    throw new Error('Anthropic API key not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file');
  }
  return client;
};

/**
 * Upload and process PDF or slides in base64 format
 * This stores the course materials in Claude's context for future scenario generation
 */
export const uploadCourseMaterials = async (
  fileName: string,
  base64Data: string,
  mimeType: string
): Promise<{ success: boolean; summary: string; error?: string }> => {
  try {
    const claude = getClaudeClient();

    // For PDFs, use document support in Claude API
    const messages: ConversationMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: `This is course material for an Applied Analysis of Banking and Financial Markets class. Please analyze this document and:
1. Extract the key concepts, theories, and frameworks discussed
2. Identify specific topics that could be used for market simulation scenarios (e.g., interest rate risk, derivatives, portfolio theory, market efficiency, etc.)
3. Note any formulas, models, or analytical frameworks that should be referenced when creating scenarios
4. Summarize the main learning objectives

Store this information as you will be asked to create realistic market scenarios and provide educational feedback based on these materials.`,
          },
        ],
      },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: messages as Anthropic.MessageParam[],
    });

    const summary = response.content[0].type === 'text' ? response.content[0].text : '';

    // Store the course materials context
    courseMaterialsContext = summary;
    conversationHistory = [
      ...messages,
      {
        role: 'assistant',
        content: summary,
      },
    ];

    return {
      success: true,
      summary,
    };
  } catch (error) {
    console.error('Error uploading course materials:', error);
    return {
      success: false,
      summary: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Generate a market scenario based on uploaded course materials
 */
export const generateScenario = async (
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  specificConcepts?: string[]
): Promise<Scenario | null> => {
  try {
    const claude = getClaudeClient();

    const conceptsText = specificConcepts && specificConcepts.length > 0
      ? `Focus specifically on these concepts: ${specificConcepts.join(', ')}.`
      : '';

    const prompt = `Based on the course materials previously uploaded about Banking and Financial Markets, create a realistic market scenario that tests understanding of ${topic}.

Difficulty level: ${difficulty}
${conceptsText}

Please provide a JSON response with the following structure:
{
  "title": "Brief scenario title",
  "description": "Detailed scenario description including market context, initial conditions, and the triggering event",
  "difficulty": "${difficulty}",
  "category": "crisis|growth|volatility|event-driven|custom",
  "initialCash": number (starting cash for the student),
  "duration": number (scenario duration in days, e.g., 5-30),
  "objectives": [
    {
      "description": "What the student should achieve",
      "type": "return|risk|holdings|trades",
      "target": number
    }
  ],
  "marketConditions": [
    {
      "day": number,
      "eventType": "news|economic|political|technical",
      "description": "What happens on this day",
      "impact": "positive|negative|neutral",
      "affectedAssets": ["AAPL", "GOOGL", etc.]
    }
  ],
  "relevantConcepts": ["List of course concepts this scenario tests"]
}

Make the scenario realistic, educational, and aligned with the concepts from the course materials. The scenario should have a clear learning objective tied to specific topics from the uploaded materials.`;

    const messages: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: messages as Anthropic.MessageParam[],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Update conversation history
    conversationHistory = [
      ...messages,
      {
        role: 'assistant',
        content: responseText,
      },
    ];

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response');
      return null;
    }

    const scenarioData = JSON.parse(jsonMatch[0]);

    // Convert to Scenario type
    const scenario: Scenario = {
      id: `scenario-${Date.now()}`,
      title: scenarioData.title,
      description: scenarioData.description,
      difficulty: scenarioData.difficulty,
      category: scenarioData.category,
      initialCash: scenarioData.initialCash,
      duration: scenarioData.duration,
      objectives: scenarioData.objectives.map((obj: { description: string; type: string; target: number }, idx: number) => ({
        id: `obj-${idx}`,
        description: obj.description,
        type: obj.type,
        target: obj.target,
        achieved: false,
      })),
      marketConditions: scenarioData.marketConditions.map((mc: { day: number; eventType: string; description: string; impact: string; affectedAssets: string[] }) => ({
        day: mc.day,
        eventType: mc.eventType,
        description: mc.description,
        impact: mc.impact,
        affectedAssets: mc.affectedAssets,
      })),
      isActive: false,
      createdAt: new Date(),
    };

    return scenario;
  } catch (error) {
    console.error('Error generating scenario:', error);
    return null;
  }
};

/**
 * Evaluate trading decisions and provide educational feedback
 */
export const evaluateTradingDecisions = async (
  scenario: Scenario,
  trades: Trade[],
  finalValue: number,
  initialValue: number
): Promise<{
  score: number;
  feedback: string;
  conceptsApplied: string[];
  conceptsMissed: string[];
  suggestions: string[];
}> => {
  try {
    const claude = getClaudeClient();

    const returnPercent = ((finalValue - initialValue) / initialValue) * 100;

    const tradesDescription = trades.map(t =>
      `Day ${t.timestamp}: ${t.type.toUpperCase()} ${t.quantity} ${t.symbol} at $${t.price.toFixed(2)} (Total: $${t.total.toFixed(2)})`
    ).join('\n');

    const prompt = `The student just completed a market scenario. Based on the course materials, please evaluate their trading decisions and provide educational feedback.

Scenario: ${scenario.title}
Description: ${scenario.description}
Difficulty: ${scenario.difficulty}

Objectives:
${scenario.objectives.map(obj => `- ${obj.description} (Target: ${obj.target})`).join('\n')}

Student's Trades:
${tradesDescription}

Market Outcome:
- Initial Value: $${initialValue.toFixed(2)}
- Final Value: $${finalValue.toFixed(2)}
- Return: ${returnPercent.toFixed(2)}%

Please provide a JSON response with the following structure:
{
  "score": number (0-100 based on objectives met and decision quality),
  "feedback": "Detailed analysis of their trading decisions, referencing specific concepts from the course materials",
  "conceptsApplied": ["Concepts they correctly applied"],
  "conceptsMissed": ["Concepts they should have considered but didn't"],
  "suggestions": ["Specific recommendations for improvement"]
}

Make your feedback educational and reference specific theories, models, or frameworks from the uploaded course materials. Explain what they did well and what they could improve.`;

    const messages: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: messages as Anthropic.MessageParam[],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Update conversation history
    conversationHistory = [
      ...messages,
      {
        role: 'assistant',
        content: responseText,
      },
    ];

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return {
      score: evaluation.score,
      feedback: evaluation.feedback,
      conceptsApplied: evaluation.conceptsApplied || [],
      conceptsMissed: evaluation.conceptsMissed || [],
      suggestions: evaluation.suggestions || [],
    };
  } catch (error) {
    console.error('Error evaluating trades:', error);
    return {
      score: 0,
      feedback: 'Unable to evaluate trades at this time.',
      conceptsApplied: [],
      conceptsMissed: [],
      suggestions: [],
    };
  }
};

/**
 * Explain a market outcome using course terminology
 */
export const explainMarketOutcome = async (
  event: string,
  impact: string,
  affectedAssets: string[]
): Promise<string> => {
  try {
    const claude = getClaudeClient();

    const prompt = `Based on the course materials, explain the following market event and its impact using appropriate financial terminology and concepts:

Event: ${event}
Impact: ${impact}
Affected Assets: ${affectedAssets.join(', ')}

Provide a brief educational explanation (2-3 paragraphs) that references relevant theories or frameworks from the course materials. This should help a student understand the "why" behind market movements.`;

    const messages: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: messages as Anthropic.MessageParam[],
    });

    const explanation = response.content[0].type === 'text' ? response.content[0].text : '';

    // Update conversation history
    conversationHistory = [
      ...messages,
      {
        role: 'assistant',
        content: explanation,
      },
    ];

    return explanation;
  } catch (error) {
    console.error('Error explaining market outcome:', error);
    return 'Unable to provide explanation at this time.';
  }
};

/**
 * Get a list of suggested topics from the course materials
 */
export const getSuggestedTopics = async (): Promise<string[]> => {
  if (!courseMaterialsContext) {
    return [
      'Interest Rate Risk',
      'Portfolio Diversification',
      'Options and Derivatives',
      'Market Efficiency',
      'Credit Risk',
      'Monetary Policy',
    ];
  }

  try {
    const claude = getClaudeClient();

    const prompt = `Based on the course materials you analyzed earlier, provide a list of 8-10 specific topics that would make good market simulation scenarios. Format your response as a JSON array of strings.

Example: ["Interest Rate Risk", "Options Pricing", "Portfolio Theory", ...]`;

    const messages: ConversationMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: messages as Anthropic.MessageParam[],
    });

    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse the JSON array
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('Error getting suggested topics:', error);
    return [];
  }
};

/**
 * Reset conversation history (useful when starting a new session)
 */
export const resetConversationHistory = () => {
  conversationHistory = [];
  courseMaterialsContext = '';
};

/**
 * Check if course materials have been uploaded
 */
export const hasCourseMaterials = (): boolean => {
  return courseMaterialsContext.length > 0;
};

// Legacy functions for backwards compatibility
export const analyzeDocument = async (content: string): Promise<ClaudeAnalysis> => {
  const claude = getClaudeClient();

  const message = await claude.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Analyze this financial document and provide insights: ${content}`,
      },
    ],
  });

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
    model: 'claude-sonnet-4-5-20250929',
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
