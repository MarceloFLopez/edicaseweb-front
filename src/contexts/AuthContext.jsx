import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {

  // Verifica se há um usuário salvo no fechar/abrir a aba
const [user, setUser] = useState(() => {
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
});
const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(false);
}, []);

useEffect(() => {
  try {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  } catch {
    // opcional: log de erro
  }
}, [user]);

  async function login(email, senha) {
    try {
      const response = await api.post('/login', { email, senha });
      const userData = response.data.user; // O seu backend retorna { nome, cargo }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erro no login" };
    }
  }

  async function logout() {
    try {
      await api.post('/logout');
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (error) {
      toast.error("Erro ao deslogar", error);
    }
  }

  return (
    <AuthContext.Provider value={{ authenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}