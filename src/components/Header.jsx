import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import Swal from "sweetalert2"; // 1. Importe o SweetAlert2
import "../assets/css/Header.css";

export function Header() {
  const { user, logout } = useContext(AuthContext);

  // 2. Crie a função de confirmação de saída
  const handleLogout = () => {
    Swal.fire({
      title: "Sair do sistema?",
      text: "Você precisará fazer login novamente para acessar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, sair",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // Executa a função de logout do seu Contexto
      }
    });
  };

  return (
    <nav className="header-nav">
      <div className="header-container">
        <div className="header-links">
          <Link to="/home" className="header-link">Home</Link>

          {user?.cargo === "USER" && (
            <Link to="/programacao" className="header-link">Programação</Link>
          )}

          {user?.cargo === "MANAGER" && (
            <>
              <Link to="/programacao" className="header-link">Programação</Link>
              <Link to="/transacoes" className="header-link">Pagamentos</Link>
              <Link to="/comunicados" className="header-link">Comunicados</Link>
              <Link to="/usuarios" className="header-link">Usuários</Link>
            </>
          )}

          {user?.cargo === "ADMIN" && (
            <Link to="/usuarios" className="header-link">Usuários</Link>
          )}
        </div>

        <div className="header-user-area">
          <span className="header-user-info">
            👤 <strong>{user?.email}</strong> ({user?.cargo})
          </span>
          {/* 3. Troque o onClick para a nova função handleLogout */}
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}