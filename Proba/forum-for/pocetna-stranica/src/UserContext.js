import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => Cookies.get('jwt-token') || '');

  useEffect(() => {
    // Ako neko drugi menja localStorage u drugom tabu, updateuj ovde
    const onStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
      setToken(Cookies.get('jwt-token') || '');
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const login = (newUser, newToken) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    Cookies.set('jwt-token', newToken, { expires: 7, secure: true, sameSite: 'Strict' });
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    Cookies.remove('jwt-token');
    setUser(null);
    setToken('');
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
