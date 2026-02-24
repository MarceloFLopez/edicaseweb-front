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

// ... imports ...

function PrivateRoute({ children }) {
  const { authenticated, loading } = useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/" />;
  
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
          <Route path="/" element={<Login />} />
          {/* Todas as rotas abaixo agora ganham Header e Footer automaticamente */}
          <Route path="/comunicados" element={<PrivateRoute><Comunicados /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/programacao" element={<PrivateRoute><Programacao /></PrivateRoute>} />
          <Route path="/transacoes" element={<PrivateRoute><Transacoes /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}