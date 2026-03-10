import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import api from "../services/api"; // Importe sua instância do Axios
import Swal from "sweetalert2";
import "../assets/css/Header.css";

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      title: "Sair do sistema?",
      text: "Sua sessão será encerrada com segurança.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2054fd",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) logout();
    });
  };

  // NOVA FUNÇÃO: Alterar Senha
  const handleAlterarSenha = async () => {
    const { value: novaSenha } = await Swal.fire({
      title: "Alterar minha senha",
      input: "password",
      inputLabel: "Digite sua nova senha",
      inputPlaceholder: "Mínimo 6 caracteres",
      showCancelButton: true,
      confirmButtonColor: "#2054fd",
      confirmButtonText: "Salvar Nova Senha",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value || value.length < 4) {
          return "A senha deve ter pelo menos 4 caracteres!";
        }
      }
    });

    if (novaSenha) {
      try {
        // Como o backend usa o ID do TOKEN, não precisamos passar o ID no corpo
        await api.put("/alterar-minha-senha", { senha: novaSenha });
        
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Sua senha foi atualizada com sucesso.",
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire("Erro!", err.response?.data?.error || "Erro ao atualizar senha.", "error");
      }
    }
  };

  return (
    <nav className="header-nav">
      <div className="header-container">
        <div className="header-left">
          <div className="header-brand">EDITORIAL<span> GMD</span></div>
          <div className="header-links">
            <Link to="/home" className={`header-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
            {(user?.cargo === "USER" ) && (
             <><Link to="/programacao" className={`header-link ${location.pathname === '/programacao' ? 'active' : ''}`}>Programação</Link>
              <Link to="/epubs" className={`header-link ${location.pathname === '/epubs' ? 'active' : ''}`}>Epubs</Link></> 
            )}
            {user?.cargo === "MANAGER" && (
              <>
                <Link to="/programacao" className={`header-link ${location.pathname === '/programacao' ? 'active' : ''}`}>Programação</Link>
                <Link to="/epubs" className={`header-link ${location.pathname === '/epubs' ? 'active' : ''}`}>Epubs</Link>
                <Link to="/comunicados" className={`header-link ${location.pathname === '/comunicados' ? 'active' : ''}`}>Comunicados</Link>
                <Link to="/transacoes" className={`header-link ${location.pathname === '/transacoes' ? 'active' : ''}`}>Pagamentos</Link>
                <Link to="/usuarios" className={`header-link ${location.pathname === '/usuarios' ? 'active' : ''}`}>Usuários</Link>
                
              </>
            )}
            {user?.cargo === "ADMIN"  &&  (
              <Link to="/usuarios" className={`header-link ${location.pathname === '/usuarios' ? 'active' : ''}`}>Usuários</Link>
            )}
          </div>
        </div>

<div className="header-user-area">
  {/* Avatar à esquerda */}
  <div className="user-avatar">{user?.nome?.charAt(0).toUpperCase()}</div>

  {/* Coluna Central: Dados + Ação */}
  <div className="user-info-column">
    <div className="user-main-details">
      <span className="user-email">{user?.email}</span>
    </div>
    
    {/* Botão de Alterar Senha como um link de ação */}
    <button 
      className="btn-change-password" 
      onClick={handleAlterarSenha}
      title="Clique para alterar sua senha"
    >
      <span className="icon-key">🔑</span> Alterar senha
    </button>
  </div>

  {/* Botão Sair Isolado à direita */}
  <button onClick={handleLogout} className="btn-logout-minimal">
    Sair
  </button>
</div>
      </div>
    </nav>
  );
}