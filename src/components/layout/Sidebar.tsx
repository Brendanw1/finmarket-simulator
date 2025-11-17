import { Home, TrendingUp, Target, Upload, Briefcase, X } from 'lucide-react';

type Page = 'upload' | 'scenarios' | 'trading' | 'portfolio';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

export const Sidebar = ({ isOpen = true, onClose, currentPage, onNavigate }: SidebarProps) => {
  const menuItems: Array<{ icon: typeof Home; label: string; page: Page }> = [
    { icon: Upload, label: 'Upload Materials', page: 'upload' },
    { icon: Target, label: 'Scenarios', page: 'scenarios' },
    { icon: TrendingUp, label: 'Trading', page: 'trading' },
    { icon: Briefcase, label: 'Portfolio', page: 'portfolio' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <h2 className="font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate?.(item.page)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.page
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
