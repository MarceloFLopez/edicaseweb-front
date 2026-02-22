import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import '../assets/css/Programacao.css';
import { CATEGORIAS, CONFIG_COLUNAS } from './programacaoConfig';
import { useRef } from 'react';

export function Programacao() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriasAtivas, setCategoriasAtivas] = useState(CATEGORIAS);
  const [mostrarOpcoesColunas, setMostrarOpcoesColunas] = useState(false)
  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [novoItem, setNovoItem] = useState({
    titulo: '',
    edicao: '',
    data_pdf: '',
    prazo_entrega: '',
    descricao: ''
  });
  const seletorRef = useRef(null);
  const [buscaColuna, setBuscaColuna] = useState('');
  const carregarProgramacao = async () => {
    try {
      setLoading(true);
      const res = await api.get('/programacao');
      setLista(res.data);
    } catch (err) {
      toast.error("Erro ao carregar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  function handleClickFora(event) {
    // Se a janela estiver aberta e o clique NÃO for dentro do container do seletor
    if (seletorRef.current && !seletorRef.current.contains(event.target)) {
      setMostrarOpcoesColunas(false);
    }
  }

  // Adiciona o evento ao carregar
  document.addEventListener("mousedown", handleClickFora);
  
  // Limpa o evento ao fechar o componente para não pesar a memória
  return () => {
    document.removeEventListener("mousedown", handleClickFora);
  };
}, [mostrarOpcoesColunas]);

  useEffect(() => { carregarProgramacao(); }, []);

  const handleSalvarNovo = async (e) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = { ...novoItem, edicao: Number(novoItem.edicao) };
      const res = await api.post('/programacao', dadosParaEnviar);
      
      toast.success("Programação criada!");
      setLista([res.data, ...lista]); 
      setModalAberto(false);
      setNovoItem({ titulo: '', edicao: '', data_pdf: '', prazo_entrega: '', descricao: '' });
    } catch (err) {
      toast.error("Erro ao criar nova programação."+err);
    }
  };

  const handleUpdateInline = async (id, campo, valorOriginal, novoValor) => {
    if (valorOriginal === novoValor) return;
    try {
      await api.put(`/programacao/${id}`, { [campo]: novoValor });
      toast.success("Salvo!", { autoClose: 800 });
      setLista(prev => prev.map(item => item.id === id ? { ...item, [campo]: novoValor } : item));
    } catch (err) {
      toast.error("Erro ao salvar."+err);
      carregarProgramacao();
    }
  };

  const toggleCategoria = (cat) => {
    setCategoriasAtivas(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };
  

  const colunasExibidas = CONFIG_COLUNAS.filter(col => categoriasAtivas.includes(col.categoria));
  const dadosFiltrados = lista.filter(item => 
    item.titulo?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="programacao-container">
      <div className="programacao-hewader">
        <h1>Programação Editorial</h1>

      </div>

<div className="programacao-controles">
  <div className="programacao-acoes-topo">
    <input 
      type="text" 
      placeholder="Filtrar por título..." 
      className="input-busca"
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
    />
    
    <div className="container-seletor-colunas" ref={seletorRef}>
      <button 
        className="btn-colunas" 
        onClick={() => setMostrarOpcoesColunas(!mostrarOpcoesColunas)}
      >
        ⚙️ Ocultar Colunas
      </button>

      {mostrarOpcoesColunas && (
<div className="janela-colunas">
    <span className="filtros-label">Gerenciar Colunas</span>
    
    {/* 1. Campo de Busca */}
    <input 
      type="text"
      placeholder="Buscar coluna..."
      className="input-busca-colunas-interna"
      value={buscaColuna}
      onChange={(e) => setBuscaColuna(e.target.value)}
    />

    <div className="filtros-grid-checkbox">
      {/* 2. Marcar/Desmarcar Todos */}
      <label className="checkbox-item-ocultar select-all">
        <input 
          type="checkbox" 
          checked={categoriasAtivas.length === 0} // Se nada está ativo, "Ocultar Tudo" está marcado
          onChange={() => {
            if (categoriasAtivas.length === 0) {
              setCategoriasAtivas(CATEGORIAS); // Mostra tudo
            } else {
              setCategoriasAtivas([]); // Oculta tudo
            }
          }}
        />
        <span className="checkbox-label" style={{fontWeight: 'bold'}}>OCULTAR TUDO</span>
      </label>

      <hr className="divisor-colunas" />

      {/* 3. Lista Filtrada */}
      {CATEGORIAS
        .filter(cat => cat.toLowerCase().includes(buscaColuna.toLowerCase()))
        .map(cat => (
          <label key={cat} className="checkbox-item-ocultar">
            <input 
              type="checkbox" 
              checked={!categoriasAtivas.includes(cat)}
              onChange={() => toggleCategoria(cat)}
            />
            <span className="checkbox-label">{cat}</span>
          </label>
      ))}
    </div>
  </div>
      )}
    </div>

    <button className="btn-novo-programacao" onClick={() => setModalAberto(true)}>+ NOVA</button>
  </div>
</div>

      <div className="table-wrapper">
        <table className="programacao-table">
          <thead>
            <tr>
              <th className="sticky-id">#</th>
              <th className="sticky-titulo">Título</th>
              {colunasExibidas.map(col => (
                <th key={col.chave}>{col.label}</th>
              ))}
              
            </tr>
          </thead>
          <tbody>
            {!loading && dadosFiltrados.map(item => (
              <tr key={item.id}>
                <td className="sticky-id">{item.id}</td>
                <td className="sticky-titulo">
                  <EditableCell 
                    valor={item.titulo} 
                    onSave={(v) => handleUpdateInline(item.id, 'titulo', item.titulo, v)} 
                  />
                </td>
                {colunasExibidas.map(col => (
                  <td key={col.chave}>
                    <EditableCell 
                      valor={item[col.chave]} 
                      type={col.tipo}
                      onSave={(v) => handleUpdateInline(item.id, col.chave, item[col.chave], v)} 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nova Programação</h2>
            <form onSubmit={handleSalvarNovo} className="form-grid">
              <div className="full-width">
                <label>Título</label>
                <input required type="text" value={novoItem.titulo} onChange={e => setNovoItem({...novoItem, titulo: e.target.value})} />
              </div>
              <div>
                <label>Edição</label>
                <input required type="number" value={novoItem.edicao} onChange={e => setNovoItem({...novoItem, edicao: e.target.value})} />
              </div>
              <div>
                <label>Data PDF</label>
                <input type="date" value={novoItem.data_pdf} onChange={e => setNovoItem({...novoItem, data_pdf: e.target.value})} />
              </div>
              <div>
                <label>Prazo Entrega</label>
                <input type="date" value={novoItem.prazo_entrega} onChange={e => setNovoItem({...novoItem, prazo_entrega: e.target.value})} />
              </div>
              <div className="full-width">
                <label>Descrição</label>
                <textarea rows="3" value={novoItem.descricao} onChange={e => setNovoItem({...novoItem, descricao: e.target.value})} />
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

// Mantenha a EditableCell aqui embaixo ou em outro arquivo
function EditableCell({ valor, onSave, type = "text" }) {
  const [editando, setEditando] = useState(false);
  const [tempValor, setTempValor] = useState(valor || '');

  const exibirValor = () => {
    if (!valor) return <span className="placeholder-edit">...</span>;
    if (type === 'date') {
      const dataStr = String(valor).substring(0, 10);
      const partes = dataStr.split('-');
      return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
    }
    return valor;
  };

  const handleBlur = () => {
    setEditando(false);
    onSave(tempValor);
  };

  if (editando) {
    return type === 'textarea' ? (
      <textarea autoFocus className="inline-edit-textarea" value={tempValor} onChange={(e) => setTempValor(e.target.value)} onBlur={handleBlur} />
    ) : (
      <input autoFocus type={type} className="inline-edit-input" value={tempValor} onChange={(e) => setTempValor(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()} />
    );
  }

  return (
    <div className={`editable-cell-text ${type === 'textarea' ? 'cell-long-text' : ''}`} onClick={() => setEditando(true)}>
      {exibirValor()}
    </div>
  );
}