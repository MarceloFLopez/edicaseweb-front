import '../assets/css/Footer.css'; // Certifique-se de que o caminho está correto

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-info">
          <strong>Sistema de Comunicados</strong> &copy; {currentYear}
        </div>
        
        <div className="footer-status">
          <span className="status-indicator"></span>
          Servidor Online
        </div>

        <nav className="footer-nav">
          <a href="/ajuda">Ajuda</a>
          <a href="/termos">Termos</a>
          <span className="version">v1.0.2</span>
        </nav>
      </div>
    </footer>
  );
}