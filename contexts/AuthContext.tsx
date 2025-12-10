import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, setCurrentUser as setStorageUser, getUsers, saveUsers } from '../services/storageService';

interface AuthContextType extends AuthState {
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (username: string, pass: string) => {
    const users = getUsers();
    const found = users.find(u => u.username === username && u.password === pass);
    if (found) {
      setUser(found);
      setStorageUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setStorageUser(null);
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!user) return false;
    
    // Fetch fresh user list to ensure we update the correct record
    const users = getUsers();
    const currentUserIndex = users.findIndex(u => u.id === user.id);
    
    if (currentUserIndex === -1) return false;
    
    // Validate old password
    if (users[currentUserIndex].password !== oldPass) return false;

    // Update password
    users[currentUserIndex].password = newPass;
    users[currentUserIndex].isFirstLogin = false; // Mark as not first login
    saveUsers(users);
    
    // Update local state
    const updatedUser = users[currentUserIndex];
    setUser(updatedUser);
    setStorageUser(updatedUser);
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout,
      changePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
