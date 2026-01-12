import { useEffect, useState } from 'react';
import api from '../services/api';
import '../assets/css/Home.css';

export function Home() {
  const [comunicados, setComunicados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    api.get('/comunicados')
      .then(res => {
        setComunicados(res.data);
        if (res.data.length > 0) setSelecionado(res.data[0]);
      })
      .catch(err => console.error(err));
  }, []);

  if (comunicados.length === 0) return <div className="empty-state">Nenhum aviso no mural.</div>;

  return (
    <div className="home-container">
      {/* EXIBIÇÃO DO SELECIONADO (FICA NO TOPO) */}
      <article className="main-highlight">
        <span className="card-tag-destaque">Comunicado Oficial</span>
        <h1>{selecionado?.titulo}</h1>
        <div className="main-content">
          {selecionado?.conteudo}
        </div>
        <div style={{marginTop: '30px', fontSize: '0.8rem', color: '#bbb'}}>
          Publicado por <strong>{selecionado?.autor}</strong> em {new Date(selecionado?.data_criacao).toLocaleDateString()}
        </div>
      </article>

      {/* LISTA ESTILO TIMELINE ABAIXO */}
      <section className="timeline-section">
        <h3 style={{marginBottom: '30px', color: '#666'}}>Anteriores</h3>
        {comunicados.map(c => (
          <div 
            key={c.id} 
            className={`timeline-item ${selecionado?.id === c.id ? 'active' : ''}`}
            onClick={() => {
                setSelecionado(c);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe para ler
            }}
          >
            <span className="item-date">{new Date(c.data_criacao).toLocaleDateString()}</span>
            <h4 className="item-titulo">{c.titulo}</h4>
          </div>
        ))}
      </section>
    </div>
  );
}