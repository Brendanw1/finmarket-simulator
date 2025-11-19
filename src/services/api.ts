/**
 * API client for backend server
 * This handles all communication with our Express backend which proxies Anthropic API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{
    type: string;
    source?: { type: string; media_type: string; data: string };
    text?: string;
  }>;
}

export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text?: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call the Claude API via our backend proxy
 */
export const callClaudeAPI = async (
  request: ClaudeRequest
): Promise<ClaudeResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/claude/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling backend API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with backend server');
  }
};

/**
 * Check if the backend server is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};
