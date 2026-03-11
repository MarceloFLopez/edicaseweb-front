import { useNavigate } from 'react-router-dom';
import '../assets/css/Erro500.css';

export function Pagina500() {
  const navigate = useNavigate();

  return (
    <div className="erro-500-container">
      <h1>500</h1>
      <h2>Ops! Falha no Código/Aplicação.</h2>
      <p>O recurso que você procura está indisponível devido a um erro no servidor.</p>
      <button onClick={() => navigate('/home')} className="btn-voltar">
        Voltar para o Início  
      </button>
    </div>
  );
}