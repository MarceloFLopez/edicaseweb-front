import { useEffect, useState } from 'react';
import api from '../services/api';
import '../assets/css/Home.css';

export function Home() {
  const [comunicados, setComunicados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/comunicados')
      .then(res => {
        setComunicados(res.data);
        if (res.data.length > 0) setSelecionado(res.data[0]);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Carregando mural...</div>;
  if (comunicados.length === 0) return <div className="empty-state">Nenhum aviso no mural.</div>;

  return (
    <div className="home-wrapper">
      <header className="home-header">
        <h1>Mural de Comunicados</h1>
      </header>

      <div className="home-content-layout">
        {/* COLUNA ESQUERDA: LEITURA */}
        <main className="reading-area">
          <article className="main-highlight-card">
            <div className="card-meta">
              <span className="card-tag">Comunicado Oficial</span>
              <span className="card-date-top">
                {new Date(selecionado?.data_criacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <h1>{selecionado?.titulo}</h1>
            
            <div className="main-content-body">
              {selecionado?.conteudo}
            </div>

            <footer className="main-footer">
              <div className="author-info">
                <div className="author-avatar">{selecionado?.autor?.charAt(0)}</div>
                <div>
                  <p className="author-name">{selecionado?.autor}</p>
                  <p className="author-label">Equipe de Gestão</p>
                </div>
              </div>
            </footer>
          </article>
        </main>

        {/* COLUNA DIREITA: LISTA (SIDEBAR) */}
        <aside className="timeline-sidebar">
          <h3>Histórico</h3>
          <div className="timeline-container">
            {comunicados.map(c => (
              <div key={c.id} className={`timeline-card ${selecionado?.id === c.id ? 'active' : ''}`}
                onClick={() => {
                  setSelecionado(c);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="timeline-date">{new Date(c.data_criacao).toLocaleDateString('pt-BR')}</span>
                <h4>{c.titulo}</h4>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}