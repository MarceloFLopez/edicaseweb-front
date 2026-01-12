import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "../assets/css/Header.css"; // Certifique-se de que o caminho está correto

export function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="header-nav">
      <div className="header-container">
        <div className="header-links">
          <Link to="/home" className="header-link">
            Home
          </Link>
          
          {(user?.cargo === "ADMIN" || user?.cargo === "MANAGER") && (
            <>
              <Link to="/usuarios" className="header-link">
                Usuários
              </Link>
              <Link to="/comunicados" className="header-link">
                Gestão de Comunicados
              </Link>
            </>
          )}
        </div>

        <div className="header-user-area">
          <span className="header-user-info">
            👤 <strong>{user?.nome}</strong> ({user?.cargo})
          </span>
          <button onClick={logout} className="btn-logout">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}