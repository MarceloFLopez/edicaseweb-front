import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Epubs.css'; // Usando o mesmo CSS
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export function Epubs() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [novoEpub, setNovoEpub] = useState({
    titulo_completo: '',
    edicao: '',
    data_solicitacao: new Date().toISOString().split('T')[0],
    criador_nome: '',
    manager_nome: user?.nome || '', // Sugere o nome do usuário logado
    status: 'pendente'
  });

  const [buscaTitulo, setBuscaTitulo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const carregarEpubs = async () => {
    try {
      const res = await api.get('/epubs'); // Ajuste o caminho conforme sua rota
      setLista(res.data);
    } catch (err) {
      toast.error("Erro ao carregar ePubs: " + err.message);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { carregarEpubs(); }, []);

  const handleUpdateInline = async (id, campo, valorOriginal, novoValor) => {
    if (valorOriginal === novoValor) return;
    try {
      await api.put(`/epubs/${id}`, { [campo]: novoValor });
      toast.success("Atualizado!", { autoClose: 800 });
      setLista(prev => prev.map(e => e.id === id ? { ...e, [campo]: novoValor } : e));
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
      carregarEpubs();
    }
  };

  const handleCriarEpub = async (e) => {
    e.preventDefault();
    try {
      await api.post('/epubs', novoEpub);
      toast.success("Solicitação de ePub criada!");
      setModalAberto(false);
      setNovoEpub({ 
        titulo_completo: '', edicao: '', 
        data_solicitacao: new Date().toISOString().split('T')[0], 
        criador_nome: '', manager_nome: user?.nome || '', status: 'pendente' 
      });
      carregarEpubs();
    } catch (err) {
      toast.error("Erro ao criar: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    const resultado = await Swal.fire({
      title: 'Deseja excluir?',
      text: "O registro do ePub será removido permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sim, excluir!'
    });

    if (resultado.isConfirmed) {
      try {
        await api.delete(`/epubs/${id}`);
        await Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500, showConfirmButton: false });
        window.location.reload(); 
      } catch (err) {
        Swal.fire('Erro!', err.message, 'error');
      }
    }
  };

  const epubsFiltrados = lista.filter(e => {
    const bateTitulo = e.titulo_completo.toLowerCase().includes(buscaTitulo.toLowerCase());
    const bateStatus = filtroStatus === '' || e.status === filtroStatus;
    return bateTitulo && bateStatus;
  });

  return (
    <div className="transacao-container">
      <div className="transacoes-container">
        <h1>Controle de ePubs</h1>
        
        <div className="acoes-header">
          <input 
            type="text" 
            className="input-busca-transacoes" 
            placeholder="Pesquisar título do livro..." 
            value={buscaTitulo}
            onChange={(e) => setBuscaTitulo(e.target.value)}
          />

          <select
            className="select-filtro-transacoes"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
          </select>

          <button className="btn-novo-comunicado" onClick={() => setModalAberto(true)}>
            + NOVO EPUB
          </button>
        </div>

        <div className="table-wrapper">
          <table className="transacoes-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Ação</th>
                <th>Título Completo</th>
                <th>Edição</th>
                <th>Solicitação</th>
                <th>Recebimento</th>
                <th>Criador</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {epubsFiltrados.map((e) => (
                <tr key={e.id}>
                  <td style={{ textAlign: 'center' }}>
                    {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
                      <button onClick={() => handleDelete(e.id)} className="btn-excluir-linha">🗑️</button>
                    )}
                  </td>
                  <td>
                    <EditableCell 
                      valor={e.titulo_completo} 
                      onSave={(v) => handleUpdateInline(e.id, 'titulo_completo', e.titulo_completo, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={e.edicao} 
                      onSave={(v) => handleUpdateInline(e.id, 'edicao', e.edicao, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={e.data_solicitacao} 
                      type="date"
                      onSave={(v) => handleUpdateInline(e.id, 'data_solicitacao', e.data_solicitacao, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={e.data_recebimento} 
                      type="date"
                      onSave={(v) => handleUpdateInline(e.id, 'data_recebimento', e.data_recebimento, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={e.criador_nome} 
                      onSave={(v) => handleUpdateInline(e.id, 'criador_nome', e.criador_nome, v)} 
                    />
                  </td>
                  <td>
                    <select 
                      value={e.status} 
                      onChange={(ev) => handleUpdateInline(e.id, 'status', e.status, ev.target.value)}
                      className={`badge ${e.status}`}
                      style={{ border: 'none', cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="pendente">🚫 PENDENTE</option>
                      <option value="concluido">✅ CONCLUÍDO</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {epubsFiltrados.length === 0 && (
            <div className="empty-state">Nenhum serviço de ePub encontrado.</div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nova Solicitação de ePub</h2>
            <form onSubmit={handleCriarEpub} className="form-grid">
               <input type="text" placeholder="Título Completo" required value={novoEpub.titulo_completo} onChange={e => setNovoEpub({...novoEpub, titulo_completo: e.target.value})} />
               <input type="text" placeholder="Edição" required value={novoEpub.edicao} onChange={e => setNovoEpub({...novoEpub, edicao: e.target.value})} />
               <input type="date" required value={novoEpub.data_solicitacao} onChange={e => setNovoEpub({...novoEpub, data_solicitacao: e.target.value})} />
               <input type="text" placeholder="Nome do Criador" required value={novoEpub.criador_nome} onChange={e => setNovoEpub({...novoEpub, criador_nome: e.target.value})} />
               <input type="text" placeholder="Manager Solicitante" required value={novoEpub.manager_nome} onChange={e => setNovoEpub({...novoEpub, manager_nome: e.target.value})} />
               
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

// Reutilizando sua lógica de EditableCell
function EditableCell({ valor, onSave, type = "text" }) {
  const [editando, setEditando] = useState(false);
  const [tempValor, setTempValor] = useState(valor || '');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setTempValor(valor || ''); }, [valor]);

  const exibirValor = () => {
    if (!valor && valor !== 0) return <span className="placeholder-edit">...</span>;
    if (type === 'date') return new Date(valor).toLocaleDateString('pt-BR');
    return valor;
  };

  const handleBlur = () => {
    setEditando(false);
    onSave(tempValor);
  };

  if (editando) {
    return (
      <input 
        autoFocus 
        type={type}
        className="inline-edit-input" 
        value={tempValor} 
        onChange={(e) => setTempValor(e.target.value)} 
        onBlur={handleBlur} 
        onKeyDown={(e) => e.key === 'Enter' && handleBlur()} 
      />
    );
  }

  return (
    <div className="editable-cell-box" onClick={() => setEditando(true)}>
      {exibirValor()}
    </div>
  );
}