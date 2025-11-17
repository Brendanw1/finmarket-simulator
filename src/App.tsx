import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PortfolioDashboard } from './components/portfolio/PortfolioDashboard';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <GameProvider>
        <div className="min-h-screen bg-gray-100">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className="flex-1 p-6">
              <PortfolioDashboard portfolio={null} />
            </main>
          </div>
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
