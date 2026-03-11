import { useNavigate } from 'react-router-dom';
import '../assets/css/Erro404.css';

export function Pagina404() {
  const navigate = useNavigate();

  return (
    <div className="erro-404-container">
      <h1>404</h1>
      <h2>Ops! Página não encontrada.</h2>
      <p>O recurso que você procura não existe ou você não tem permissão para acessá-lo.</p>
      <button onClick={() => navigate('/home')} className="btn-voltar">
        Voltar para o Início  
      </button>
    </div>
  );
}