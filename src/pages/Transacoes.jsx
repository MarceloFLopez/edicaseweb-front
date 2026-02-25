import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Transacoes.css';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // Importação do SweetAlert2

export function Transacoes() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    data: '', plataforma: '', intermediador: '', banco: '', valor: '', prazo: ''
  });

  const [filtroBanco, setFiltroBanco] = useState('');
  const [buscaPlataforma, setBuscaPlataforma] = useState('');

  const carregarTransacoes = async () => {
    try {
      const res = await api.get('/transacoes');
      setLista(res.data);
    } catch (err) {
      toast.error("Erro ao carregar lista: " + err.message);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { carregarTransacoes(); }, []);

  const handleUpdateInline = async (id, campo, valorOriginal, novoValor) => {
    if (valorOriginal === novoValor) return;
    try {
      const valorParaEnviar = campo === 'valor' ? parseFloat(novoValor) : novoValor;
      await api.put(`/transacoes/${id}`, { [campo]: valorParaEnviar });
      
      toast.success("Salvo!", { autoClose: 800 });
      setLista(prev => prev.map(t => t.id === id ? { ...t, [campo]: valorParaEnviar } : t));
    } catch (err) {
      toast.error("Erro ao salvar alteração: " + err.message);
      carregarTransacoes();
    }
  };

  const handleCriarTransacao = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transacoes', novaTransacao);
      toast.success("Transação criada!");
      setModalAberto(false);
      setNovaTransacao({ data: '', plataforma: '', intermediador: '', banco: '', valor: '', prazo: '' });
      carregarTransacoes();
    } catch (err) {
      toast.error("Erro ao criar transação: " + err.message);
    }
  };

  // FUNÇÃO DE EXCLUSÃO ATUALIZADA COM SWEETALERT2 E RECARREGAMENTO
  const handleDelete = async (id) => {
    const resultado = await Swal.fire({
      title: 'Deseja excluir?',
      text: "Esta transação será removida permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await api.delete(`/transacoes/${id}`);
        
        await Swal.fire({
          icon: 'success',
          title: 'Excluído!',
          text: 'A transação foi removida.',
          timer: 1500,
          showConfirmButton: false
        });

        // Recarrega a página conforme solicitado
        window.location.reload(); 
      } catch (err) {
        Swal.fire('Erro!', 'Não foi possível excluir: ' + err.message, 'error');
      }
    }
  };
  
  const bancosDisponiveis = [...new Set(lista.map(t => t.banco).filter(Boolean))].sort();
  
  const transacoesFiltradas = lista.filter(t => {
    const batePlataforma = t.plataforma.toLowerCase().includes(buscaPlataforma.toLowerCase());
    const bateBanco = filtroBanco === '' || t.banco === filtroBanco;
    return batePlataforma && bateBanco;
  });

  return (
    <div className="transacao-container">
      <div className="transacoes-container">
        <h1>Gestão de Transações</h1>
        
        <div className="acoes-header" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input 
            type="text" 
            className="input-busca-transacoes" 
            placeholder="Pesquisar plataforma (ex: Stripe)..." 
            value={buscaPlataforma}
            onChange={(e) => setBuscaPlataforma(e.target.value)}
          />

          <select
            className="select-filtro-transacoes"
            value={filtroBanco}
            onChange={(e) => setFiltroBanco(e.target.value)}
          >
            <option value="">Todos os Bancos</option>
            {bancosDisponiveis.map((banco) => (
              <option key={banco} value={banco}>{banco}</option>
            ))}
          </select>

          <button className="btn-novo-comunicado" onClick={() => setModalAberto(true)}>
            + NOVO
          </button>
        </div>

        <div className="table-wrapper">
          <table className="transacoes-table">
            <thead>
              <tr>
                {/* COLUNA DE AÇÃO NO INÍCIO */}
                <th style={{ width: '50px' }}>Ação</th>
                <th>Data</th>
                <th>Plataforma</th>
                <th>Intermediador</th>
                <th>Banco</th>
                <th>Valor</th>
                <th>Prazo</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map((t) => (
                <tr key={t.id}>
                  {/* BOTÃO DE EXCLUIR NO INÍCIO (Restrito a ADMIN/MANAGER se desejar) */}
                  <td style={{ textAlign: 'center' }}>
                    {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
                      <button onClick={() => handleDelete(t.id)} className="btn-excluir-linha">🗑️</button>
                    )}
                  </td>
                  <td>
                    <EditableCell 
                      valor={t.data} 
                      type="date"
                      onSave={(v) => handleUpdateInline(t.id, 'data', t.data, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={t.plataforma} 
                      onSave={(v) => handleUpdateInline(t.id, 'plataforma', t.plataforma, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={t.intermediador} 
                      onSave={(v) => handleUpdateInline(t.id, 'intermediador', t.intermediador, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={t.banco} 
                      onSave={(v) => handleUpdateInline(t.id, 'banco', t.banco, v)} 
                    />
                  </td>
                  <td className="col-valor">
                    <EditableCell 
                      valor={t.valor} 
                      type="number"
                      onSave={(v) => handleUpdateInline(t.id, 'valor', t.valor, v)} 
                    />
                  </td>
                  <td>
                    <EditableCell 
                      valor={t.prazo} 
                      onSave={(v) => handleUpdateInline(t.id, 'prazo', t.prazo, v)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transacoesFiltradas.length === 0 && (
            <div className="empty-state">Nenhuma transação encontrada.</div>
          )}
        </div>
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nova Transação</h2>
            <form onSubmit={handleCriarTransacao} className="form-grid">
               <input type="date" required value={novaTransacao.data} onChange={e => setNovaTransacao({...novaTransacao, data: e.target.value})} />
               <input type="text" placeholder="Plataforma" required value={novaTransacao.plataforma} onChange={e => setNovaTransacao({...novaTransacao, plataforma: e.target.value})} />
               <input type="number" step="0.01" placeholder="Valor" required value={novaTransacao.valor} onChange={e => setNovaTransacao({...novaTransacao, valor: e.target.value})} />
               
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

// EditableCell permanece igual...
function EditableCell({ valor, onSave, type = "text" }) {
  const [editando, setEditando] = useState(false);
  const [tempValor, setTempValor] = useState(valor || '');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTempValor(valor || '');
  }, [valor]);

  const exibirValor = () => {
    if (!valor && valor !== 0) return <span className="placeholder-edit">...</span>;
    if (type === 'date') return new Date(valor).toLocaleDateString('pt-BR');
    if (type === 'number') return `R$ ${parseFloat(valor).toFixed(2)}`;
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
        type={type === 'number' ? 'text' : type}
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