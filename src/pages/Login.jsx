import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    const result = await login(email, senha);

    if (result.success) {
      toast.success(`Bem-vindo, ${email}!`);
      navigate('/home'); // Redireciona para a Home após logar
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Acessar Sistema</h2>
        
        {erro && <p style={styles.error}>{erro}</p>}

        <div style={styles.inputGroup}>
          <label>E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="seu@email.com"
            required 
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>Senha</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="******"
            required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Entrar</button>
      </form>
    </div>
  );
}

// Estilos Clean inline para facilitar sua implementação inicial
const styles = {
  container: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '24px', color: '#333', fontSize: '24px' },
  inputGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '12px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },
  error: { color: 'r@ed', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '4px', textAlign: 'center', marginBottom: '15px' }
};