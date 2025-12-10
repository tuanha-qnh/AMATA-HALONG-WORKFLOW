import React from 'react';
import { LogOut, LayoutDashboard, CheckSquare, Users, UserCircle, BarChart2, Settings, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'tasks', label: t('tasks'), icon: CheckSquare, roles: [UserRole.ADMIN, UserRole.STAFF] },
    { id: 'reports', label: t('reports'), icon: BarChart2, roles: [UserRole.ADMIN] },
    { id: 'users', label: t('users'), icon: Users, roles: [UserRole.ADMIN] },
    { id: 'settings', label: t('settings'), icon: Settings, roles: [UserRole.ADMIN] },
    { id: 'profile', label: t('profile'), icon: UserCircle, roles: [UserRole.ADMIN, UserRole.STAFF] },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-xl flex-shrink-0">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              WorkFlow
            </h1>
            <p className="text-xs text-slate-400 mt-1">Pro Management</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.filter(item => item.roles.includes(user?.role || UserRole.STAFF)).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
           {/* Language Switcher */}
           <div className="flex items-center justify-between mb-4 bg-slate-700 rounded p-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Globe size={16} />
                  <span>{language === 'en' ? 'English' : 'Tiếng Việt'}</span>
              </div>
              <div className="flex gap-1">
                  <button 
                    onClick={() => setLanguage('vi')}
                    className={`text-xs px-2 py-1 rounded ${language === 'vi' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >VI</button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`text-xs px-2 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  >EN</button>
              </div>
           </div>

          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white py-2 rounded-md transition-all text-sm"
          >
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10 md:hidden">
            <h1 className="text-xl font-bold text-gray-800">WorkFlow Pro</h1>
        </header>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};