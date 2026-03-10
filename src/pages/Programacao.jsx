import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "../assets/css/Programacao.css";
import {
  CORES_CATEGORIAS,
  CONFIG_COLUNAS,
  COR_PADRAO,
} from "./programacaoConfig";
import { useRef } from "react";
import Swal from "sweetalert2";

export function Programacao() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  // Substitua a linha do useState por esta:
  const [categoriasAtivas, setCategoriasAtivas] = useState(
    Object.keys(CORES_CATEGORIAS),
  );
  const [mostrarOpcoesColunas, setMostrarOpcoesColunas] = useState(false);
  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [novoItem, setNovoItem] = useState({
    titulo: "",
    edicao: "",
    data_pdf: "",
    prazo_entrega: "",
    descricao: "",
  });
  const seletorRef = useRef(null);
  const [buscaColuna, setBuscaColuna] = useState("");
  const carregarProgramacao = async () => {
    try {
      setLoading(true);
      const res = await api.get("/programacao");
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

  useEffect(() => {
    carregarProgramacao();
  }, []);

  const handleSalvarNovo = async (e) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = { ...novoItem, edicao: Number(novoItem.edicao) };

      // 1. Envia os dados para o backend
      await api.post("/programacao", dadosParaEnviar);

      // 2. Exibe o alerta de sucesso
      await Swal.fire({
        icon: "success",
        title: "Criado!",
        text: "A programação foi criada com sucesso.",
        timer: 1500,
        showConfirmButton: false,
      });

      // 3. Fecha o modal e recarrega a página
      setModalAberto(false);
      window.location.reload(); // <--- Aqui acontece o recarregamento
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: err.response?.data?.message || "Erro ao criar nova programação.",
      });
    }
  };

  const handleUpdateInline = async (id, campo, valorOriginal, novoValor) => {
    if (valorOriginal === novoValor) return;
    try {
      await api.put(`/programacao/${id}`, { [campo]: novoValor });
      toast.success("Salvo!", { autoClose: 800 });
      setLista((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [campo]: novoValor } : item,
        ),
      );
    } catch (err) {
      toast.error("Erro ao salvar." + err);
      carregarProgramacao();
    }
  };

  const handleDelete = async (id) => {
    // 1. Substitui o window.confirm pelo SweetAlert2
    const resultado = await Swal.fire({
      title: "Deseja realmente excluir?",
      text: "Esta ação não poderá ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    });

    // Se o usuário clicou em cancelar, interrompe a função
    if (!resultado.isConfirmed) return;

    try {
      // 2. Chama a API para deletar
      await api.delete(`/programacao/${id}`);

      // 3. Exibe o alerta de sucesso
      await Swal.fire({
        icon: "success",
        title: "Excluído!",
        text: "O registro foi removido com sucesso.",
        timer: 1500,
        showConfirmButton: false,
      });

      // 4. Recarrega a página para atualizar todos os dados
      window.location.reload();
    } catch (err) {
      const msgErro =
        err.response?.data?.message || "Erro ao excluir o registro";

      Swal.fire({
        icon: "error",
        title: "Erro!",
        text: msgErro,
      });

      console.error("Erro detalhado:", err);
    }
  };

  const toggleCategoria = (cat) => {
    setCategoriasAtivas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const colunasExibidas = CONFIG_COLUNAS.filter((col) =>
    categoriasAtivas.includes(col.categoria),
  );
  const dadosFiltrados = lista.filter((item) =>
    item.titulo?.toLowerCase().includes(busca.toLowerCase()),
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
                          setCategoriasAtivas(Object.keys(CORES_CATEGORIAS)); // Mostra tudo (Array de chaves)
                        } else {
                          setCategoriasAtivas([]); // Oculta tudo
                        }
                      }}
                    />
                    <span
                      className="checkbox-label"
                      style={{ fontWeight: "bold" }}
                    >
                      OCULTAR TUDO
                    </span>
                  </label>

                  <hr className="divisor-colunas" />

                  {/* 3. Lista Filtrada */}
                  {Object.keys(CORES_CATEGORIAS)
  .filter(cat => cat.toLowerCase().includes(buscaColuna.toLowerCase()))
  .map(cat => (
    <label key={cat} className="checkbox-item-ocultar">
      <input
        type="checkbox"
        checked={!categoriasAtivas.includes(cat)} // Marcado se estiver oculto
        onChange={() => toggleCategoria(cat)}
      />
      <span className="checkbox-label">{cat}</span>
    </label>
  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-novo-programacao"
            onClick={() => setModalAberto(true)}
          >
            + NOVO
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="programacao-table">
          <thead>
            <tr>
              {/* Nova coluna de ação antes do # */}
              <th style={{ width: "50px" }}>Ações</th>
              <th className="sticky-id">#</th>
              <th className="sticky-titulo">Título</th>
              {colunasExibidas.map((col) => {
                const corBase = CORES_CATEGORIAS[col.categoria] || COR_PADRAO;

                return (
                  <th
                    key={col.chave}
                    style={{
                      borderBottom: `3px solid ${corBase}`,
                      position: "relative",
                      paddingTop: "20px", // Espaço para o nome da categoria
                    }}
                  >
                    {/* Pequeno rótulo da categoria acima do nome da coluna */}
                    <span
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "8px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        color: corBase,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {col.categoria}
                    </span>

                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              dadosFiltrados.map((item) => (
                <tr key={item.id}>
                  <td className="acoes-cell">
                    <button
                      className="btn-acao"
                      onClick={() => handleDelete(item.id)}
                    >
                      🗑️
                    </button>
                  </td>
                  <td className="sticky-id">{item.id}</td>
                  <td className="sticky-titulo">
                    <EditableCell
                      valor={item.titulo}
                      type="text"
                      onSave={(v) =>
                        handleUpdateInline(item.id, "titulo", item.titulo, v)
                      }
                    />
                  </td>
                  {colunasExibidas.map((col) => (
                    <td key={col.chave}>
                      <EditableCell
                        valor={item[col.chave]}
                        type={col.tipo}
                        onSave={(v) =>
                          handleUpdateInline(
                            item.id,
                            col.chave,
                            item[col.chave],
                            v,
                          )
                        }
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
                <input
                  required
                  type="text"
                  value={novoItem.titulo}
                  onChange={(e) =>
                    setNovoItem({ ...novoItem, titulo: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Edição</label>
                <input
                  required
                  type="number"
                  value={novoItem.edicao}
                  onChange={(e) =>
                    setNovoItem({ ...novoItem, edicao: e.target.value })
                  }
                />
              </div>

              <div className="full-width">
                <label>Descrição</label>
                <textarea
                  rows="3"
                  value={novoItem.descricao}
                  onChange={(e) =>
                    setNovoItem({ ...novoItem, descricao: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions full-width">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  Salvar
                </button>
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
  const [tempValor, setTempValor] = useState(valor || "");

  const exibirValor = () => {
    if (!valor) return <span className="placeholder-edit">...</span>;
    if (type === "date") {
      const dataStr = String(valor).substring(0, 10);
      const partes = dataStr.split("-");
      return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : valor;
    }
    return valor;
  };

  const handleBlur = () => {
    setEditando(false);
    onSave(tempValor);
  };

  if (editando) {
    return type === "textarea" ? (
      <textarea
        autoFocus
        className="inline-edit-textarea"
        value={tempValor}
        onChange={(e) => setTempValor(e.target.value)}
        onBlur={handleBlur}
      />
    ) : (
      <input
        autoFocus
        type={type}
        className="inline-edit-input"
        value={tempValor}
        onChange={(e) => setTempValor(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      />
    );
  }

  return (
    <div
      className={`editable-cell-text ${type === "textarea" ? "cell-long-text" : ""}`}
      onClick={() => setEditando(true)}
    >
      {exibirValor()}
    </div>
  );
}
