import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import '../assets/css/Usuarios.css';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // 1. Importar SweetAlert2

export function Usuarios() {
  const [lista, setLista] = useState([]);
  const { user } = useContext(AuthContext);

  const [modalAberto, setModalAberto] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', senha: '' });
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/listar-usuarios');
      setLista(res.data);
    } catch (err) {
      toast.error("Erro ao carregar lista: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/criar-usuario', novoUsuario);
      
      await Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Usuário criado com sucesso!',
        timer: 1500,
        showConfirmButton: false
      });

      setModalAberto(false);
      setNovoUsuario({ nome: '', email: '', senha: '' });
      carregarUsuarios();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao criar usuário");
    }
  };

  const handleRoleChange = async (id, novaPermissao) => {
    try {
      await api.put(`/editar-usuario/${id}`, { permissao: novaPermissao });
      toast.success("Permissão atualizada!");
      carregarUsuarios();
    } catch (err) {
      toast.error("Erro ao alterar permissão" + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id, statusAtual) => {
    try {
      await api.put(`/editar-usuario/${id}`, { ativo: !statusAtual });
      toast.success(statusAtual ? "Usuário desativado" : "Usuário ativado");
      carregarUsuarios();
    } catch (err) {
      toast.error("Erro ao mudar status" + (err.response?.data?.message || err.message));
    }
  };

  // 2. FUNÇÃO DELETE COM SWEETALERT2
  const handleDelete = async (id) => {
    const resultado = await Swal.fire({
      title: 'Tem certeza?',
      text: "O usuário será removido permanentemente!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await api.delete(`/deletar-usuario/${id}`);
        
        await Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'Usuário removido com sucesso.',
            timer: 1500,
            showConfirmButton: false
        });

        carregarUsuarios(); // Aqui você pode usar reload ou apenas recarregar a lista
      } catch (err) {
        toast.error("Erro ao excluir: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const usuariosFiltrados = lista.filter(u => {
    const buscaNome = u.nome.toLowerCase().includes(filtroNome.toLowerCase()) || 
                      u.email.toLowerCase().includes(filtroNome.toLowerCase());
    const buscaCargo = filtroCargo === '' || u.permissao === filtroCargo;
    return buscaNome && buscaCargo;
  });

  return (
    <div className="usuario-container">
      <div className="usuarios-container">
        <h1>Gestão de Usuários</h1>
        
        <div className="usuarios-header">
          <div className="acoes-header">
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="filtro-busca"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
            <select 
              className="select-filtro-usuarios"
              value={filtroCargo}
              onChange={(e) => setFiltroCargo(e.target.value)}
            >
              <option value="">Todos os Cargos</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="USER">USER</option>
            </select>

            {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
              <button className="btn-novo-comunicado" onClick={() => setModalAberto(true)}>
                + NOVO USUÁRIO
              </button>
            )}
          </div>
        </div>

        <table className="usuarios-table">
          <thead>
            <tr>
              {/* 3. COLUNA DE AÇÕES NO INÍCIO */}
              <th style={{ width: '180px' }}>Ações</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Permissão</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                {/* 4. BOTÕES DE AÇÃO NA PRIMEIRA COLUNA */}
                <td >
                  <div className="acoes-group">
                    <button 
                      onClick={() => handleToggleStatus(u.id, u.ativo)}
                      className={`btn-acao ${u.ativo ? 'btn-desativar' : 'btn-ativar'}`}
                    >
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </button>

                    {(user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER') && (
                      <button onClick={() => handleDelete(u.id)} className="btn-acao btn-excluir">
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  {user?.cargo === 'ADMIN' || user?.cargo === 'MANAGER' ? (
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
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <p style={{textAlign: 'center', marginTop: '20px', color: '#999'}}>
            Nenhum usuário encontrado.
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
    </div>
  );
}