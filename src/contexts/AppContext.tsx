import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  role: 'admin' | 'user';
};

type AppContextType = {
  currentLang: 'en' | 'hi';
  toggleLanguage: () => void;
  user: User | null;
  isLoggedIn: boolean; // <-- Add this line
  login: (email: string, password: string, role: 'admin' | 'user') => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'hi'>('en');
  // Initialize user from localStorage if present
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const toggleLanguage = () => {
    setCurrentLang(currentLang === 'en' ? 'hi' : 'en');
  };

  const login = async (email: string, password: string, role: 'admin' | 'user') => {
    if (role !== 'admin') throw new Error('Only admin login is supported');
    try {
      const res = await fetch('https://jansunwayi-portal-ayodhya.onrender.com/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await res.json();
      const userObj: User = { id: 'admin', name: data.email, role: 'admin' as 'admin' };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj)); // Save to localStorage
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Remove from localStorage
  };

  const value = {
    currentLang,
    toggleLanguage,
    user,
    isLoggedIn: !!user, // <-- Add this line
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
