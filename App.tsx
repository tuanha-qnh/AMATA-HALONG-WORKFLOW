import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { TaskCreate } from './components/TaskCreate';
import { Profile } from './components/Profile';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { getTasks, getUsers } from './services/storageService';
import { Task, User } from './types';
import { LogIn } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, login, changePassword } = useAuth();
  const { t } = useLanguage();
  const [activePage, setActivePage] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Force Change Password State
  const [newPass, setNewPass] = useState('');

  const loadData = () => {
    setTasks(getTasks());
    setUsers(getUsers());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
        // Reset state on logout
        setUsername('');
        setPassword('');
        setLoginError('');
        setActivePage('dashboard');
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setLoginError('Invalid credentials');
    }
  };

  const handleForcePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if(changePassword(password, newPass)) {
          alert('Password changed successfully. Please continue.');
      } else {
          alert('Error changing password');
      }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">WorkFlow Pro</h1>
            <p className="text-gray-500">Sign in to manage your tasks</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> Sign In
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400">
             Demo: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  // Force Password Change Screen
  if (user?.isFirstLogin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-yellow-500">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Change Default Password</h2>
                <p className="text-sm text-gray-600 mb-6">For security reasons, you must change your password before continuing.</p>
                <form onSubmit={handleForcePasswordChange} className="space-y-4">
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        className="w-full border p-2 rounded"
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button type="submit" className="w-full bg-yellow-500 text-white font-bold py-2 rounded hover:bg-yellow-600">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
      )
  }

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && <Dashboard tasks={tasks} user={user} allUsers={users} />}
      {activePage === 'tasks' && (
        <TaskList 
            tasks={tasks} 
            users={users} 
            currentUser={user} 
            onTaskClick={setSelectedTask} 
            onCreateClick={() => setIsCreating(true)} 
        />
      )}
      {activePage === 'reports' && <Reports tasks={tasks} users={users} />}
      {activePage === 'users' && (
          <UserManagement users={users} currentUser={user} onUpdate={loadData} />
      )}
      {activePage === 'settings' && <Settings />}
      {activePage === 'profile' && <Profile />}

      {/* Modals */}
      {selectedTask && (
        <TaskDetail 
            task={selectedTask} 
            users={users} 
            currentUser={user}
            onClose={() => setSelectedTask(null)}
            onUpdate={() => {
                loadData();
                setSelectedTask(null);
            }}
        />
      )}

      {isCreating && (
        <TaskCreate 
            users={users} 
            currentUser={user} 
            onClose={() => setIsCreating(false)}
            onSuccess={() => {
                loadData();
                setIsCreating(false);
            }}
        />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;