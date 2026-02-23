import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Transacoes.css';
import { toast } from 'react-toastify';

export function Transacoes() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    data: '', plataforma: '', intermediador: '', banco: '', valor: '', prazo: ''
  });

  // Mantivemos apenas o que é necessário para os novos filtros
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

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir transação?")) return;
    try {
      await api.delete(`/transacoes/${id}`);
      setLista(prev => prev.filter(t => t.id !== id));
      toast.success("Excluído!");
    } catch (err) {
      toast.error("Erro ao excluir." + err.message);
    }
  };
  
  const bancosDisponiveis = [...new Set(lista.map(t => t.banco).filter(Boolean))].sort();
  // LOGICA DE FILTRO UNIFICADA (Barra de Busca + Select de Banco)
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
          {/* BARRA DE BUSCA POR TEXTO */}
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
              <option key={banco} value={banco}>
                {banco}
              </option>
            ))}
          </select>

          {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
            <button className="btn-novo-comunicado" onClick={() => setModalAberto(true)}>
              + NOVA TRANSAÇÃO
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="transacoes-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Plataforma</th>
                <th>Intermediador</th>
                <th>Banco</th>
                <th>Valor</th>
                <th>Prazo</th>
                <th style={{ width: '80px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map((t) => (
                <tr key={t.id}>
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
                  <td style={{ textAlign: 'center' }}>
                    {user?.cargo === 'ADMIN' && (
                      <button onClick={() => handleDelete(t.id)} className="btn-excluir-linha">🗑️</button>
                    )}
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

      {/* MODAL DE CADASTRO (Simplificado para o exemplo) */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nova Transação</h2>
            <form onSubmit={handleCriarTransacao} className="form-grid">
               {/* Seus inputs de cadastro aqui... */}
               <input type="date" required value={novaTransacao.data} onChange={e => setNovaTransacao({...novaTransacao, data: e.target.value})} />
               <input type="text" placeholder="Plataforma" required value={novaTransacao.plataforma} onChange={e => setNovaTransacao({...novaTransacao, plataforma: e.target.value})} />
               <input type="number" step="0.01" placeholder="Valor" required value={novaTransacao.valor} onChange={e => setNovaTransacao({...novaTransacao, valor: e.target.value})} />
               {/* Adicione os outros campos conforme necessário */}
               <div className="modal-actions">
                 <button type="button"className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
                 <button type="submit" className="btn-salvar">Salvar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EditableCell({ valor, onSave, type = "text" }) {
  const [editando, setEditando] = useState(false);
  const [tempValor, setTempValor] = useState(valor || '');

  useEffect(() => {
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