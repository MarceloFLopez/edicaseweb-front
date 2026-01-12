import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Comunicados.css';
import { toast } from 'react-toastify';

export function Comunicados() {
  const [comunicados, setComunicados] = useState([]);
  const { user } = useContext(AuthContext);

  // Estados para Modais e Formulários
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null); // Armazena o ID do comunicado sendo editado
  const [form, setForm] = useState({ titulo: '', conteudo: '' });

  const carregarComunicados = async () => {
    try {
      const res = await api.get('/comunicados');
      setComunicados(res.data); // Corrigido: usando setComunicados
    } catch (err) {
      console.error("Erro ao carregar comunicados", err);
    }
  };

 useEffect(() => {
    // Definimos uma função assíncrona interna para evitar o chamado síncrono direto
    const fetchDados = async () => {
      await carregarComunicados();
    };
    
    fetchDados();
  }, []); // Mantém o array vazio para rodar apenas uma vez ao montar

  const handleAbrirModal = (comunicado = null) => {
    if (comunicado) {
      setEditando(comunicado.id);
      setForm({ titulo: comunicado.titulo, conteudo: comunicado.conteudo });
    } else {
      setEditando(null);
      setForm({ titulo: '', conteudo: '' });
    }
    setModalAberto(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        // Rota de Edição (ajuste conforme seu backend)
        await api.put(`/comunicados/${editando}`, form);
        toast.success("Comunicado atualizado!");
      } else {
        // Rota de Criação
        await api.post('/comunicados', form);
        toast.success("Comunicado criado!");
      }
      setModalAberto(false);
      carregarComunicados();
    } catch (err) {
      toast.error("Erro ao salvar: " + (err.response?.data?.error || err.message));
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Deseja realmente excluir este comunicado?")) {
      try {
        await api.delete(`/comunicados/${id}`);
        carregarComunicados();
      } catch (err) {
        toast.error("Erro ao excluir: " + err.message);
      }
    }
  };

  return (
    <div className="comunicados-container">
      <div className="comunicados-header">
        <h1>Gestão de Comunicados</h1>
        {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
          <button className="btn-novo-comunicado" onClick={() => handleAbrirModal()}>
            + NOVO COMUNICADO
          </button>
        )}
      </div>

      <table className="comunicados-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {comunicados.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.titulo}</strong></td>
              <td><span className="badge-autor">{c.autor}</span></td>
              <td>{new Date(c.data_criacao).toLocaleDateString()}</td>
              <td>
                <div className="acoes-group">
                  <button className="btn-editar-comunicado" onClick={() => handleAbrirModal(c)}>
                    Editar
                  </button>
                  <button className="btn-excluir-comunicado" onClick={() => handleExcluir(c.id)}>
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL ÚNICO PARA CRIAR E EDITAR */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editando ? "Editar Comunicado" : "Novo Comunicado"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título</label>
                <input 
                  type="text" 
                  required 
                  value={form.titulo}
                  onChange={(e) => setForm({...form, titulo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Conteúdo</label>
                <textarea 
                  required 
                  rows="5"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                  value={form.conteudo}
                  onChange={(e) => setForm({...form, conteudo: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn-salvar">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}