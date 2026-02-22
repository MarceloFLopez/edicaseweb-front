import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Transacoes.css';
import { toast } from 'react-toastify';

export function Transacoes() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);

  // Estados para o Modal e Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    data: '',
    plataforma: '',
    intermediador: '',
    banco: '',
    valor: '',
    prazo: ''
  });

  const [filtroPlataforma, setFiltroPlataforma] = useState('');
  const [filtroBanco, setFiltroBanco] = useState('');

  const carregarTransacoes = async () => {
    try {
      const res = await api.get('/transacoes');
      setLista(res.data);
    } catch (err) {
      toast.error("Erro ao carregar lista: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/transacoes');
        if (isMounted) setLista(res.data);
      } catch (err) {
        toast.error("Erro ao carregar dados iniciais", err);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  // --- FUNÇÃO PARA CRIAR TRANSAÇÃO ---
  const handleCriarTransacao = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transacoes', novaTransacao);
      
      toast.success("Transação criada com sucesso!");
      setModalAberto(false);
      setNovaTransacao({
        data: '',
        plataforma: '',
        intermediador: '',
        banco: '',
        valor: '',
        prazo: ''
      });
      carregarTransacoes();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao criar transação");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transacoes/${id}`);
      toast.success("Transação deletada com sucesso!");
      carregarTransacoes();
    } catch (err) {
      toast.error("Erro ao excluir: " + (err.response?.data?.message || err.message));
    }
  };

  // Lógica de Filtro
  const transacoesFiltradas = lista.filter(t => {
    const buscaPlataforma = filtroPlataforma === '' || t.plataforma === filtroPlataforma;
    const buscaBanco = filtroBanco === '' || t.banco === filtroBanco;
    
    return buscaPlataforma && buscaBanco;
  });

  return (
    <div className="transacao-container">
      <div className="transacoes-container">
        <h1>Gestão de Transações</h1>
        <div className="transacoes-header">
          <div className="acoes-header">
            <select 
              className="select-filtro-transacoes"
              value={filtroPlataforma}
              onChange={(e) => setFiltroPlataforma(e.target.value)}
            >
              <option value="">Todas as Plataformas</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="PagSeguro">PagSeguro</option>
            </select>

            <select 
              className="select-filtro-transacoes"
              value={filtroBanco}
              onChange={(e) => setFiltroBanco(e.target.value)}
            >
              <option value="">Todos os Bancos</option>
              <option value="Bradesco">Bradesco</option>
              <option value="Itaú">Itaú</option>
              <option value="Santander">Santander</option>
              <option value="Caixa">Caixa</option>
            </select>

            {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
              <button className="btn-novo-comunicado" onClick={() => setModalAberto(true)}>
                + NOVA TRANSAÇÃO
              </button>
            )}
          </div>
        </div>

        <table className="transacoes-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Plataforma</th>
              <th>Intermediador</th>
              <th>Banco</th>
              <th>Valor</th>
              <th>Prazo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoesFiltradas.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.data).toLocaleDateString('pt-BR')}</td>
                <td>{t.plataforma}</td>
                <td>{t.intermediador}</td>
                <td>{t.banco}</td>
                <td>R$ {parseFloat(t.valor).toFixed(2)}</td>
                <td>{t.prazo}</td>
                <td>
                  <div className="acoes-group">
                    {user?.cargo === 'ADMIN' && (
                      <button onClick={() => handleDelete(t.id)} className="btn-acao btn-excluir">
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mensagem de lista vazia */}
        {transacoesFiltradas.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '20px', color: '#999'}}>
            Nenhuma transação encontrada com esses filtros.
          </p>
        )}

        {/* --- MODAL DE CADASTRO --- */}
        {modalAberto && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Nova Transação</h2>
              <form onSubmit={handleCriarTransacao}>
                <div className="form-group">
                  <label>Data</label>
                  <input 
                    type="date" 
                    required 
                    value={novaTransacao.data}
                    onChange={(e) => setNovaTransacao({...novaTransacao, data: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Plataforma</label>
                  <input 
                    type="text" 
                    required 
                    value={novaTransacao.plataforma}
                    onChange={(e) => setNovaTransacao({...novaTransacao, plataforma: e.target.value})}
                    placeholder="Ex: Stripe, PayPal"
                  />
                </div>
                <div className="form-group">
                  <label>Intermediador</label>
                  <input 
                    type="text" 
                    required 
                    value={novaTransacao.intermediador}
                    onChange={(e) => setNovaTransacao({...novaTransacao, intermediador: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Banco</label>
                  <input 
                    type="text" 
                    required 
                    value={novaTransacao.banco}
                    onChange={(e) => setNovaTransacao({...novaTransacao, banco: e.target.value})}
                    placeholder="Ex: Bradesco, Itaú"
                  />
                </div>
                <div className="form-group">
                  <label>Valor</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={novaTransacao.valor}
                    onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Prazo</label>
                  <input 
                    type="text" 
                    required 
                    value={novaTransacao.prazo}
                    onChange={(e) => setNovaTransacao({...novaTransacao, prazo: e.target.value})}
                    placeholder="Ex: 30 dias"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
                  <button type="submit" className="btn-salvar">Criar Transação</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}