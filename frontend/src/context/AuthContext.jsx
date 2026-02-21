import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('luxe_user')); } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('luxe_token', token);
    localStorage.setItem('luxe_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const { token, ...userData } = res.data;
    localStorage.setItem('luxe_token', token);
    localStorage.setItem('luxe_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('luxe_token');
    localStorage.removeItem('luxe_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
