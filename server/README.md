# Backend API Server

This is the Express.js backend server that handles Anthropic API calls for the FinMarket Simulator.

## Why We Need This

The Anthropic API blocks direct browser requests due to CORS (Cross-Origin Resource Sharing) security policies. This backend server acts as a secure proxy between your React frontend and the Anthropic API.

## Features

- **Secure API Key Management**: API keys are stored on the server, not exposed to the browser
- **CORS Support**: Configured to accept requests from the React frontend
- **Error Handling**: Proper error handling and logging
- **Health Check**: `/health` endpoint for monitoring server status

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Copy `.env.example` to `.env` and fill in your Anthropic API key:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `PORT`: Server port (default: 3001)
   - `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

3. **Start the Server**

   For production:
   ```bash
   npm run server
   ```

   For development (with auto-reload):
   ```bash
   npm run server:dev
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

### Claude Messages
```
POST /api/claude/messages
```
Proxies requests to the Anthropic API.

**Request Body:**
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ]
}
```

**Response:**
Returns the Anthropic API response directly.

## Development

The server runs on `http://localhost:3001` by default. Make sure this matches the `VITE_API_URL` in your frontend `.env` file.

## Security Notes

- Never commit your `.env` file with real API keys
- The API key is only stored on the backend server
- CORS is configured to only accept requests from your frontend
- In production, update `FRONTEND_URL` to your actual frontend domain

## Troubleshooting

**Server won't start:**
- Check that port 3001 is not already in use
- Verify your `.env` file exists and has the correct format

**CORS errors:**
- Ensure `FRONTEND_URL` in `.env` matches your frontend URL
- Check that the frontend is making requests to the correct backend URL

**API key errors:**
- Verify your Anthropic API key is valid
- Make sure `ANTHROPIC_API_KEY` is set in `.env` (not `VITE_ANTHROPIC_API_KEY`)
