import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// eslint-disable-next-line react-refresh/only-export-components
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
  // eslint-disable-next-line react-hooks/set-state-in-effect
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
    
    // 1. Pega os dados brutos do backend
    const rawUser = response.data.user; 
    
    console.log("Dados brutos vindos do backend:", rawUser);

    // 2. Normaliza os dados para o Frontend
    const userData = {
      // Mantém o que já veio (nome, etc)
      ...rawUser, 
      // Garante que o ID exista (seja id ou _id)
      id: rawUser.id || rawUser._id, 
      // Garante que o email esteja presente (se não vier no user, usa o do input)
      email: rawUser.email || email,
      // Força o cargo para MAIÚSCULO para bater com o IF do componente (ADMIN/MANAGER)
      cargo: rawUser.cargo ? rawUser.cargo.toUpperCase() : 'USER'
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return { success: true };
  } catch (error) {
    console.error("Erro no login:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Erro ao acessar o servidor" 
    };
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