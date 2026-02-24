import { useContext } from "react";
import { Link, useLocation } from "react-router-dom"; // Adicionado useLocation para efeito de link ativo
import { AuthContext } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import "../assets/css/Header.css";

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation(); // Para saber em qual página estamos

  const handleLogout = () => {
    Swal.fire({
      title: "Sair do sistema?",
      text: "Sua sessão será encerrada com segurança.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1a1a1a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) logout();
    });
  };

  return (
    <nav className="header-nav">
      <div className="header-container">
        <div className="header-left">
          {/* Logo Editorial */}
          <div className="header-brand">
            EDITORIAL<span>CMS</span>
          </div>

          <div className="header-links">
            <Link to="/home" className={`header-link ${location.pathname === '/home' ? 'active' : ''}`}>
              Home
            </Link>

            {(user?.cargo === "USER" || user?.cargo === "MANAGER") && (
              <Link to="/programacao" className={`header-link ${location.pathname === '/programacao' ? 'active' : ''}`}>
                Programação
              </Link>
            )}

            {user?.cargo === "MANAGER" && (
              <>
                <Link to="/transacoes" className={`header-link ${location.pathname === '/transacoes' ? 'active' : ''}`}>
                  Pagamentos
                </Link>
                <Link to="/comunicados" className={`header-link ${location.pathname === '/comunicados' ? 'active' : ''}`}>
                  Comunicados
                </Link>
              </>
            )}

            {user?.cargo === "ADMIN" && (
              <Link to="/usuarios" className={`header-link ${location.pathname === '/usuarios' ? 'active' : ''}`}>
                Usuários
              </Link>
            )}
          </div>
        </div>

        <div className="header-user-area">
          <div className="user-profile">
             <div className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
             <div className="user-details">
                <span className="user-email">{user?.email}</span>
                <span className="user-badge">{user?.cargo}</span>
             </div>
          </div>
          <button onClick={handleLogout} className="btn-logout-minimal" title="Sair do sistema">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}