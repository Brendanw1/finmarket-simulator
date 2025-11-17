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

- React 18 + TypeScript + Vite
- Tailwind CSS
- Claude API (claude-sonnet-4-5-20250929)
- Firebase (Authentication + Firestore)
- Recharts

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

### 5. Run Development Server

```bash
npm run dev
```

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

- Claude API calls are made from the browser (use backend proxy for production)
- Max file size: 10MB for uploads
- Costs: ~$0.10-0.30 per scenario/feedback

## License

MIT License
