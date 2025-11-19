import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Support large base64 documents

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Proxy endpoint for Anthropic API
app.post('/api/claude/messages', async (req, res) => {
  try {
    const { model, max_tokens, messages } = req.body;

    // Validate required fields
    if (!model || !max_tokens || !messages) {
      return res.status(400).json({
        error: 'Missing required fields: model, max_tokens, or messages',
      });
    }

    // Validate API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Anthropic API key not configured on server',
      });
    }

    // Make the API call to Anthropic
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages,
    });

    // Return the response to the frontend
    res.json(response);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);

    // Handle specific error types
    if (error.status) {
      return res.status(error.status).json({
        error: error.message || 'Error from Anthropic API',
        details: error.error || {},
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not set in environment variables');
  }
});
