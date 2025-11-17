import { Menu, LogOut } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  onMenuClick?: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export const Header = ({ onMenuClick, user, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FinMarket Simulator</h1>
            <p className="text-xs text-gray-500">AI-Powered Study Tool</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
