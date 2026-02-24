import '../assets/css/Footer.css';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo-text">EDITORIAL</span>
          <span className="footer-divider">|</span>
          <span className="footer-copyright">
            &copy; {currentYear} Gestão de Mídia Digital
          </span>
        </div>
        
        <div className="footer-center">
          <div className="server-status">
            <span className="status-dot"></span>
            <span className="status-text">Sistemas Operacionais</span>
          </div>
        </div>

        <nav className="footer-links">
          <span className="app-version">Build v1.2.0</span>
        </nav>
      </div>
    </footer>
  );
}