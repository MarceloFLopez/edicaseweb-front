import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Usuarios.css'; // <--- Importação do novo arquivo
import { toast } from 'react-toastify';

export function Usuarios() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);

  // Estados para o Modal e Formuário
  const [modalAberto, setModalAberto] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '' });

  const [filtroNome, setFiltroNome] = useState(''); // Estado para o nome
  const [filtroCargo, setFiltroCargo] = useState(''); // Estado para o cargo

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/listar-usuarios');
      setLista(res.data);
    } catch (err) {
      toast.err("Erro ao carregar lista: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const res = await api.get('/listar-usuarios');
        if (isMounted) setLista(res.data);
      } catch (err) {
        toast.error("Erro ao carregar dados iniciais", err);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);
  // --- FUNÇÃO PARA CRIAR USUÁRIO ---
  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    try {
      // Chamada para o seu backend
      await api.post('/criar-usuario', novoUsuario);
      
      toast.success("Usuário criado com sucesso!");
      setModalAberto(false); // Fecha o modal
      setNovoUsuario({ nome: '', email: '', senha: '' }); // Limpa o form
      carregarUsuarios(); // Recarrega a lista automaticamente
    } catch (err) {
      // Aqui o backend avisará se o e-mail já existe
      toast.error(err.response?.data?.error || "Erro ao criar usuário");
    }
  };

  const handleRoleChange = async (id, novaPermissao) => {
    try {
      await api.put(`/editar-usuario/${id}`, { permissao: novaPermissao });
      carregarUsuarios();
    } catch (err) {
      toast.error("Erro ao alterar permissão: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id, statusAtual) => {
    try {
      await api.put(`/editar-usuario/${id}`, { ativo: !statusAtual });
      carregarUsuarios();
    } catch (err) {
      toast.error("Erro ao mudar status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir?")) {
      try {
        await api.delete(`/deletar-usuario/${id}`);
        carregarUsuarios();
      } catch (err) {
        toast.error("Erro ao excluir: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Lógica de Filtro (feita no front-end para agilidade)
  const usuariosFiltrados = lista.filter(u => {
    const buscaNome = u.nome.toLowerCase().includes(filtroNome.toLowerCase()) || 
                     u.email.toLowerCase().includes(filtroNome.toLowerCase());
    const buscaCargo = filtroCargo === '' || u.permissao === filtroCargo;
    
    return buscaNome && buscaCargo;
  });

return (
    <div className="usuarios-container">
      {/* 1. Botão movido para dentro do header para alinhar corretamente */}
      <div className="usuarios-header">
        <h1>Gestão de Usuários</h1>
        {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
          <button className="btn-novo" onClick={() => setModalAberto(true)}>
            + NOVO USUÁRIO
          </button>
        )}
      </div>

      {/* --- BARRA DE FILTROS --- */}
      <div className="filtros-container">
        <input 
          type="text" 
          placeholder="Buscar por nome ou e-mail..." 
          className="input-busca"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <select 
          className="select-filtro"
          value={filtroCargo}
          onChange={(e) => setFiltroCargo(e.target.value)}
        >
          <option value="">Todos os Cargos</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="USER">USER</option>
        </select>
      </div>

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Permissão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* CORREÇÃO AQUI: Usamos a lista filtrada, não a lista bruta */}
          {usuariosFiltrados.map((u) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>
                {user?.cargo === 'ADMIN' ? (
                  <select 
                    className="select-permissao"
                    value={u.permissao} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                ) : (
                  <span className="badge-permissao">{u.permissao}</span>
                )}
              </td>
              <td>
                <span className={u.ativo ? "status-ativo" : "status-inativo"}>
                  {u.ativo ? '● Ativo' : '○ Inativo'}
                </span>
              </td>
              <td>
                <div className="acoes-group">
                  <button 
                    onClick={() => handleToggleStatus(u.id, u.ativo)}
                    className={`btn-acao ${u.ativo ? 'btn-desativar' : 'btn-ativar'}`}
                  >
                    {u.ativo ? 'Desativar' : 'Ativar'}
                  </button>

                  {user?.cargo === 'ADMIN' && (
                    <button onClick={() => handleDelete(u.id)} className="btn-acao btn-excluir">
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
      {usuariosFiltrados.length === 0 && (
        <p style={{textAlign: 'center', marginTop: '20px', color: '#999'}}>
          Nenhum usuário encontrado com esses filtros.
        </p>
      )}

      {/* --- MODAL DE CADASTRO --- */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Novo Usuário</h2>
            <form onSubmit={handleCriarUsuario}>
              <div className="form-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input 
                  type="email" 
                  required 
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Senha Inicial</label>
                <input 
                  type="password" 
                  required 
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setModalAberto(false)}>Cancelar</button>
                <button type="submit" className="btn-salvar">Criar Usuário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}