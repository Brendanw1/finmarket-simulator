import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider, useGame } from './contexts/GameContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MaterialsUpload } from './components/upload/MaterialsUpload';
import { ScenarioSelector } from './components/scenarios/ScenarioSelector';
import { TradingInterface } from './components/trading/TradingInterface';
import { PortfolioDashboard } from './components/portfolio/PortfolioDashboard';
import { ScenarioResults } from './components/scenarios/ScenarioResults';
import { LogIn, UserPlus, Loader } from 'lucide-react';
import { signIn as firebaseSignIn, signUp as firebaseSignUp } from './services/firebase';

// Simple routing component
type Page = 'upload' | 'scenarios' | 'trading' | 'portfolio' | 'results';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await firebaseSignUp(email, password, displayName);
      } else {
        await firebaseSignIn(email, password);
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FinMarket Simulator
          </h1>
          <p className="text-gray-600">
            AI-Powered Financial Markets Study Tool
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { gameState, resetGame, trades } = useGame();
  const [currentPage, setCurrentPage] = useState<Page>('upload');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => setCurrentPage('upload')} />;
  }

  // Check if we should show results page
  const showResults = gameState.currentScenario &&
    gameState.currentDay >= gameState.currentScenario.duration &&
    gameState.portfolio;

  const handleLogout = async () => {
    await signOut();
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false);
          }}
        />

        <main className="flex-1 p-6">
          {showResults && gameState.currentScenario && gameState.portfolio ? (
            <ScenarioResults
              scenario={gameState.currentScenario}
              trades={trades}
              finalValue={gameState.portfolio.totalValue}
              initialValue={gameState.currentScenario.initialCash}
              onRestart={() => {
                resetGame();
                setCurrentPage('scenarios');
              }}
              onContinue={() => {
                resetGame();
                setCurrentPage('scenarios');
              }}
            />
          ) : (
            <>
              {currentPage === 'upload' && <MaterialsUpload />}
              {currentPage === 'scenarios' && <ScenarioSelector />}
              {currentPage === 'trading' && <TradingInterface />}
              {currentPage === 'portfolio' && <PortfolioDashboard portfolio={gameState.portfolio} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
