# FinMarket Simulator

An AI-powered financial markets simulator designed as a study tool for banking and financial markets courses. Upload your course materials (textbooks, lecture slides) and get personalized trading scenarios with educational feedback powered by Claude AI.

## Features

- **Course Materials Upload**: Upload PDFs or PowerPoint presentations
- **AI-Powered Scenario Generation**: Claude creates realistic market scenarios from your course topics
- **Interactive Trading**: Practice trading stocks, bonds, crypto, and commodities
- **Educational Feedback**: Get detailed feedback referencing your course concepts
- **Portfolio Management**: Track performance with real-time charts
- **Multi-Scenario Support**: Multiple difficulty levels and topics

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js (API proxy server)
- **Styling**: Tailwind CSS
- **AI**: Claude API (claude-sonnet-4-5-20250929)
- **Database**: Firebase (Authentication + Firestore)
- **Charts**: Recharts

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

### 3. Get API Keys

- **Anthropic API**: Get from https://console.anthropic.com/
- **Firebase**: Create project at https://console.firebase.google.com/

### 4. Firebase Setup

1. Enable Email/Password authentication
2. Create Firestore database
3. Add security rules (see Firebase Console)

### 5. Run Development Servers

**Important**: You need to run BOTH the backend server and the frontend:

**Terminal 1 - Backend Server:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The backend server will run on `http://localhost:3001` and the frontend on `http://localhost:5173`.

## Usage

1. **Sign Up**: Create an account
2. **Upload Materials**: Add your course PDFs/slides
3. **Generate Scenario**: Select topic and difficulty
4. **Trade**: Make buy/sell decisions
5. **Review Feedback**: Learn from Claude's analysis

## Build for Production

```bash
npm run build
```

## Important Notes

- **Backend Required**: The app now uses a secure backend server to handle Claude API calls (no more CORS issues!)
- **API Key Security**: Your Anthropic API key is stored securely on the backend server, not exposed to the browser
- **Max file size**: 10MB for uploads
- **Costs**: ~$0.10-0.30 per scenario/feedback

## Architecture

The application uses a client-server architecture:

- **Frontend** (React): User interface running in the browser
- **Backend** (Express): Secure API proxy that communicates with Anthropic API
- **Anthropic API**: Claude AI for generating scenarios and feedback
- **Firebase**: User authentication and data storage

This architecture ensures your API keys are never exposed to the browser and solves CORS issues.

## License

MIT License
