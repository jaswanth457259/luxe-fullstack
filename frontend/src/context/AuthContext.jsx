import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('luxe_user')); } catch { return null; }
  });

  const storeSession = useCallback((authResponse) => {
    const { token, ...userData } = authResponse;
    localStorage.setItem('luxe_token', token);
    localStorage.setItem('luxe_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    return storeSession(res.data);
  }, [storeSession]);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    return storeSession(res.data);
  }, [storeSession]);

  const googleLogin = useCallback(async (credential) => {
    const res = await authApi.google({ credential });
    return storeSession(res.data);
  }, [storeSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('luxe_token');
    localStorage.removeItem('luxe_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        googleLogin,
        logout,
        isAdmin: user?.role === 'ADMIN',
        isSeller: user?.role === 'SELLER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
