# FinMarket Simulator

A comprehensive financial markets simulator designed for studying banking and finance concepts through interactive scenarios and real-time market simulations.

## 🎯 Features

- **Interactive Trading Interface**: Buy and sell various financial instruments including stocks, bonds, cryptocurrencies, commodities, and forex
- **Scenario-Based Learning**: Navigate through different market conditions and historical financial events
- **Portfolio Management**: Track your positions, performance, and asset allocation in real-time
- **AI-Powered Analysis**: Integrate with Claude AI to analyze financial documents and receive trading insights
- **Educational Materials Upload**: Upload and analyze study materials, financial reports, and research papers
- **Real-time Market Simulation**: Experience dynamic market conditions with simulated price movements
- **Performance Tracking**: Monitor your portfolio performance with interactive charts and metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### Data Visualization
- **Recharts** - Charting library for portfolio and market data visualization

### Backend Services
- **Firebase**
  - Firestore - NoSQL database for user data and portfolios
  - Firebase Auth - User authentication and authorization

### AI Integration
- **Anthropic Claude API** - AI-powered document analysis and trading insights via @anthropic-ai/sdk

### UI Components
- **Lucide React** - Icon library

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Anthropic API key

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Brendanw1/finmarket-simulator.git
cd finmarket-simulator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then fill in your credentials:

```env
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Getting API Keys

**Anthropic API Key:**
1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys section
3. Create a new API key

**Firebase Configuration:**
1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Go to Project Settings > General
4. Under "Your apps", select Web app
5. Copy the configuration values

### 4. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
finmarket-simulator/
├── src/
│   ├── components/
│   │   ├── trading/          # Trading interface components
│   │   ├── portfolio/        # Portfolio dashboard and charts
│   │   ├── scenarios/        # Scenario selection and results
│   │   ├── upload/           # Material upload components
│   │   └── layout/           # Header, sidebar, navigation
│   ├── services/
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── claude.ts         # Anthropic API integration
│   │   └── marketData.ts     # Market data simulation
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React contexts (Auth, Game)
│   ├── types/                # TypeScript type definitions
│   ├── lib/                  # Utility functions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## 🎓 How to Use

1. **Sign Up/Sign In**: Create an account or sign in with your credentials
2. **Select a Scenario**: Choose from pre-built scenarios or create a custom one
3. **Trade**: Buy and sell assets based on market conditions and your strategy
4. **Upload Materials**: Upload financial documents for AI analysis
5. **Monitor Performance**: Track your portfolio performance and progress towards objectives
6. **Complete Scenarios**: Finish scenarios to get feedback and scores

## 🔒 Security Notes

- Never commit the `.env` file to version control
- The Anthropic SDK is configured with `dangerouslyAllowBrowser: true` for development. In production, use a backend proxy
- Firebase security rules should be properly configured in the Firebase Console

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.
