import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../assets/css/Comunicados.css';

export function Comunicados() {
  const [comunicados, setComunicados] = useState([]);
  const { user } = useContext(AuthContext);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', conteudo: '' });

  const carregarComunicados = async () => {
    try {
      const res = await api.get('/comunicados');
      setComunicados(res.data);
    } catch (err) {
      toast.error("Erro ao carregar comunicados"+err);
    }
  };

useEffect(() => {
  let montado = true;

  async function buscarDados() {
    const res = await api.get('/comunicados');
    if (montado) {
      setComunicados(res.data);
    }
  }

  buscarDados();
  return () => { montado = false; }; // Limpeza para evitar vazamento de memória
}, []);

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

const handleExcluir = async (id) => {
  // 1. Confirmação para evitar exclusões acidentais
  if (!window.confirm("Tem certeza que deseja excluir este comunicado? Esta ação não pode ser desfeita.")) {
    return;
  }

  try {
    // 2. Chamada à API
    await api.delete(`/comunicados/${id}`);

    // 3. Feedback de sucesso
    toast.success("Comunicado removido com sucesso!");

    // 4. Atualização da lista local (sem precisar recarregar a página toda)
    setComunicados(prev => prev.filter(item => item.id !== id));
    
  } catch (err) {
    // 5. Tratamento de erro
    const mensagemErro = err.response?.data?.error || "Erro ao excluir o comunicado.";
    toast.error(mensagemErro);
    console.error("Erro na exclusão:", err);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/comunicados/${editando}`, form);
        toast.success("Atualizado!");
      } else {
        await api.post('/comunicados', form);
        toast.success("Criado!");
      }
      setModalAberto(false);
      carregarComunicados();
    } catch (err) {
      toast.error("Erro ao salvar."+err);
    }
  };

  return (
    <div className="comunicado-container"> {/* Container padrão */}
     <h1>Gestão de Comunicados</h1>
      <div className="comunicados-header">
        
        <div className="acoes-header">
          {/* O input de busca segue o padrão das outras telas */}
          <input type="text" placeholder="Filtrar comunicados..." className="input-busca" />
          
          {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
            <button className="btn-novo-comunicado" onClick={() => handleAbrirModal()}>
              + NOVO COMUNICADO
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper"> {/* Wrapper padrão para scroll */}
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
                <td><span className="badge-permissao">{c.autor}</span></td>
                <td>{new Date(c.data_criacao).toLocaleDateString()}</td>
                <td>
  <div className="acoes-group">
     <button className="btn-editar-comunicado" onClick={() => handleAbrirModal(c)}>Editar</button>
     <button className="btn-excluir-comunicado" onClick={() => handleExcluir(c.id)}>Excluir</button>
  </div>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editando ? "Editar Comunicado" : "Novo Comunicado"}</h2>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="full-width">
                <label>Título</label>
                <input required value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
              </div>
              <div className="full-width">
                <label>Conteúdo</label>
                <textarea required rows="8" value={form.conteudo} onChange={e => setForm({...form, conteudo: e.target.value})} />
              </div>
              <div className="modal-actions full-width">
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