import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../assets/css/Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarMe, setLembrarMe] = useState(false);
  const [loading, setLoading] = useState(false); // 1. Adicionado estado de loading

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const emailSalvo = localStorage.getItem('@Editora:email');
    if (emailSalvo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(emailSalvo);
      setLembrarMe(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); // 2. Começa o carregamento

    const result = await login(email, senha);

    if (result.success) {
      if (lembrarMe) {
        localStorage.setItem('@Editora:email', email);
      } else {
        localStorage.removeItem('@Editora:email');
      }

      toast.success(`Acesso autorizado!`);

      // 3. Aguarda 2 segundos com o spinner ativo antes de navegar
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } else {
      setLoading(false); // 4. Para o carregamento se houver erro
      toast.error(result.message || "Credenciais inválidas");
    }
  }

  return (
    <div className="login-page">
      <div className="login-branding">
        <h1>Editorial<br />Management</h1>
        <p>Sistema interno de gestão para editores e produtores de conteúdo digital.</p>
      </div>

      <div className="login-form-side">
        <form onSubmit={handleSubmit} className="login-card">
          <div className="login-header">
            <h2>Acesse sua conta</h2>
            <p>Insira suas credenciais para continuar.</p>
          </div>

          <div className="input-container">
            <label>E-mail Corporativo</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@editora.com.br"
              disabled={loading} // Desabilita campos durante loading
              required 
            />
          </div>

          <div className="input-container">
            <label>Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="••••••••"
              disabled={loading} // Desabilita campos durante loading
              required 
            />
          </div>

          <div className="remember-container">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
                disabled={loading}
              />
              <span>Lembrar meu e-mail</span>
            </label>
          </div>

          {/* 5. Botão alterado para mostrar o spinner */}
          <button type="submit" className="btn-login" enabled={loading}>
            {loading ? (
              <div className="spinner-loader"></div>
            ) : (
              "Entrar no Sistema"
            )}
          </button>

          <div className="login-footer">
            &copy; 2026 Editora Digital Mídia.
          </div>
        </form>
      </div>
    </div>
  );
}