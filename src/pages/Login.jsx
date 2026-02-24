import { useState, useContext, useEffect } from 'react'; // Adicionado useEffect
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../assets/css/Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarMe, setLembrarMe] = useState(false); // Estado do Checkbox
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Ao carregar a página, verifica se existe um e-mail salvo
  useEffect(() => {
    const emailSalvo = localStorage.getItem('@Editora:email');
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarMe(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const result = await login(email, senha);

    if (result.success) {
      // Se "Lembrar de mim" estiver marcado, salva o e-mail. Caso contrário, remove.
      if (lembrarMe) {
        localStorage.setItem('@Editora:email', email);
      } else {
        localStorage.removeItem('@Editora:email');
      }

      toast.success(`Acesso autorizado!`);
      navigate('/home');
    } else {
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
              required 
            />
          </div>

          {/* NOVO: CHECKBOX LEMBRAR DE MIM */}
          <div className="remember-container">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={lembrarMe}
                onChange={(e) => setLembrarMe(e.target.checked)}
              />
              <span>Lembrar meu e-mail</span>
            </label>
          </div>

          <button type="submit" className="btn-login">
            Entrar no Sistema
          </button>

          <div className="login-footer">
            &copy; 2026 Editora Digital Mídia.
          </div>
        </form>
      </div>
    </div>
  );
}