import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Usuarios } from './pages/Usuarios';
import { Header } from './components/Header';
import { Comunicados } from './pages/Comunicados';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Programacao } from './pages/Programacao';
import { Transacoes } from './pages/Transacoes';
import { Footer } from './components/Footer';
import { Epubs } from './pages/Epubs';
import { Pagina404 } from './pages/Pagina404'; 
import { Pagina500 } from './pages/Pagina500'; 

function PrivateRoute({ children }) {
  const { authenticated, loading } = useContext(AuthContext);
  
  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!authenticated) return <Navigate to="/" replace />;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Rota Pública */}
          <Route path="/" element={<Login />} />
          
          {/* Rotas Privadas (Protegidas) */}
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/comunicados" element={<PrivateRoute><Comunicados /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/programacao" element={<PrivateRoute><Programacao /></PrivateRoute>} />
          <Route path="/transacoes" element={<PrivateRoute><Transacoes /></PrivateRoute>} />
          <Route path="/epubs" element={<PrivateRoute><Epubs /></PrivateRoute>} />
          
          {/* Rotas de Erro (Acessíveis pelo Interceptor ou URL) */}
          <Route path="/404" element={<Pagina404 />} />
          <Route path="/500" element={<Pagina500 />} />
          
          {/* CAPTURA GLOBAL (Apenas uma!) 
              Se o usuário digitar uma URL que não existe, ele cai aqui. */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}