const { useState, useEffect, useCallback, createContext, useContext } = React;

const ToastCtx = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);
  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

const useToast = () => useContext(ToastCtx);

function useLivros() {
  const [livros, setLivros] = useState(() => Storage.get('biblioteca_livros', []));
  const salvar = useCallback((lista) => { setLivros(lista); Storage.set('biblioteca_livros', lista); }, []);
  const cadastrar = useCallback((livro) => {
    const novo = { ...livro, id: Date.now().toString(), criadoEm: new Date().toISOString(), disponivel: true };
    salvar([...livros, novo]);
    return novo;
  }, [livros, salvar]);
  const remover   = useCallback((id)        => salvar(livros.filter(l => l.id !== id)), [livros, salvar]);
  const atualizar = useCallback((id, dados) => salvar(livros.map(l => l.id === id ? { ...l, ...dados } : l)), [livros, salvar]);
  return { livros, cadastrar, remover, atualizar };
}

function useEmprestimos() {
  const [emprestimos, setEmprestimos] = useState(() => Storage.get('biblioteca_emprestimos', []));
  const salvar = useCallback((lista) => { setEmprestimos(lista); Storage.set('biblioteca_emprestimos', lista); }, []);
  const emprestar = useCallback((livroId, tituloLivro, leitor, prazo) => {
    const novo = { id: Date.now().toString(), livroId, tituloLivro, leitor,
                   dataEmprestimo: new Date().toISOString(), dataDevolucao: prazo, devolvido: false };
    salvar([...emprestimos, novo]);
  }, [emprestimos, salvar]);
  const devolver = useCallback((id) => {
    salvar(emprestimos.map(e => e.id === id ? { ...e, devolvido: true, devolvidoEm: new Date().toISOString() } : e));
  }, [emprestimos, salvar]);
  return { emprestimos, emprestar, devolver };
}

function FormGroup({ label, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && <span className="error-msg">⚠ {error}</span>}
    </div>
  );
}

function Badge({ disponivel }) {
  return (
    <span className={`book-badge ${disponivel ? 'badge-disponivel' : 'badge-emprestado'}`}>
      {disponivel ? '✓ Disponível' : '⏳ Emprestado'}
    </span>
  );
}

function Dashboard({ livros, emprestimos }) {
  const [quote]      = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [apiResults, setApiResults] = useState([]);
  const [apiQuery,   setApiQuery]   = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const ativos      = emprestimos.filter(e => !e.devolvido);
  const vencidos    = ativos.filter(e => new Date(e.dataDevolucao) < new Date());
  const disponiveis = livros.filter(l => l.disponivel).length;

  const buscarAPI = async () => {
    if (!apiQuery.trim()) return;
    setApiLoading(true);
    setApiResults([]);
    try {
      const res  = await fetch(`${OPEN_LIBRARY_API}${encodeURIComponent(apiQuery)}&limit=5`);
      if (!res.ok) throw new Error('Erro na requisição');
      const data = await res.json();
      setApiResults(data.docs.slice(0, 5).map(d => ({
        titulo: d.title,
        autor:  d.author_name?.[0] ?? 'Desconhecido',
        ano:    d.first_publish_year ?? '—',
      })));
    } catch (e) {
      setApiResults([{ titulo: 'Erro ao buscar. Tente novamente.', autor: '', ano: '' }]);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div>
      <div className="quote-box">
        {quote.text}
        <div className="quote-author">{quote.author}</div>
      </div>
      <div className="stats-grid">
        {[
          { n: livros.length,   l: 'Total de Livros', icon: '📚' },
          { n: disponiveis,     l: 'Disponíveis',      icon: '✅' },
          { n: ativos.length,   l: 'Em Empréstimo',    icon: '🔄' },
          { n: vencidos.length, l: 'Atrasados',         icon: '⚠️' },
        ].map(({ n, l, icon }) => (
          <div key={l} className="stat-card">
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div className="stat-number">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="section-title">🌐 Buscar na Open Library</h2>
        <p className="text-muted mt-1" style={{ marginBottom: '1rem' }}>
          Consulte o acervo mundial de livros via Open Library API (Fetch API + JSON).
        </p>
        <div className="search-bar">
          <input
            placeholder="Ex: Dom Casmurro, Harry Potter..."
            value={apiQuery}
            onChange={e => setApiQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarAPI()}
          />
          <button className="btn-primary" onClick={buscarAPI} disabled={apiLoading}>
            {apiLoading ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
        </div>
        {apiResults.length > 0 && (
          <div className="loan-list mt-2">
            {apiResults.map((r, i) => (
              <div key={i} className="loan-item">
                <div>
                  <div className="loan-title">📖 {r.titulo}</div>
                  <div className="loan-sub">{r.autor} · {r.ano}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CadastroLivro({ livros, onCadastrar, editando, onAtualizar, onCancelarEdicao }) {
  const [form,  setForm]  = useState(editando ?? LIVRO_VAZIO);
  const [erros, setErros] = useState({});
  const toast = useToast();

  useEffect(() => { setForm(editando ?? LIVRO_VAZIO); setErros({}); }, [editando]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (erros[name]) setErros(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    const novosErros = validarLivro(form);
    if (Object.keys(novosErros).length) { setErros(novosErros); return; }
    const isbnLimpo = form.isbn.replace(/-/g, '');
    const duplicado = livros.find(l => l.isbn.replace(/-/g, '') === isbnLimpo && l.id !== editando?.id);
    if (duplicado) { setErros({ isbn: 'ISBN já cadastrado.' }); return; }
    if (editando) {
      onAtualizar(editando.id, form);
      toast('Livro atualizado com sucesso!', 'info');
    } else {
      onCadastrar(form);
      toast('Livro cadastrado com sucesso! 📚', 'success');
      setForm(LIVRO_VAZIO);
    }
  };

  return (
    <div>
      <h1 className="section-title">{editando ? '✏️ Editar Livro' : '➕ Cadastrar Livro'}</h1>
      <div className="card">
        <div className="form-grid">
          <FormGroup label="Título *"            error={erros.titulo}>
            <input name="titulo"  value={form.titulo}  onChange={handleChange} placeholder="Ex: O Senhor dos Anéis" />
          </FormGroup>
          <FormGroup label="Autor *"             error={erros.autor}>
            <input name="autor"   value={form.autor}   onChange={handleChange} placeholder="Ex: J.R.R. Tolkien" />
          </FormGroup>
          <FormGroup label="ISBN *"              error={erros.isbn}>
            <input name="isbn"    value={form.isbn}    onChange={handleChange} placeholder="Ex: 9788533613379" />
          </FormGroup>
          <FormGroup label="Ano de Publicação *" error={erros.ano}>
            <input name="ano" type="number" value={form.ano} onChange={handleChange} placeholder="Ex: 1954" />
          </FormGroup>
          <FormGroup label="Editora"             error={erros.editora}>
            <input name="editora" value={form.editora} onChange={handleChange} placeholder="Ex: HarperCollins" />
          </FormGroup>
          <FormGroup label="Gênero *"            error={erros.genero}>
            <select name="genero" value={form.genero} onChange={handleChange}>
              <option value="">Selecione...</option>
              {GENEROS.map(g => <option key={g}>{g}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Sinopse" error={erros.sinopse} className="full">
            <textarea name="sinopse" value={form.sinopse} onChange={handleChange}
              rows={3} placeholder="Breve descrição do livro..." style={{ resize: 'vertical' }} />
          </FormGroup>
        </div>
        <div className="flex gap-1 mt-3">
          <button className="btn-primary" onClick={handleSubmit}>
            {editando ? '💾 Salvar Alterações' : '✅ Cadastrar Livro'}
          </button>
          {editando && (
            <button className="btn-secondary" onClick={onCancelarEdicao}>Cancelar</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Acervo({ livros, onRemover, onEditar, emprestimos, onEmprestimo, onDevolucao }) {
  const [busca,    setBusca]    = useState('');
  const [filtro,   setFiltro]   = useState('todos');
  const [genero,   setGenero]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [empForm,  setEmpForm]  = useState({ leitor: '', dataDevolucao: '' });
  const [empErros, setEmpErros] = useState({});
  const toast = useToast();

  const filtrados = livros.filter(l => {
    const q = busca.toLowerCase();
    const matchBusca  = !q || l.titulo.toLowerCase().includes(q) || l.autor.toLowerCase().includes(q) || l.isbn.includes(q);
    const matchStatus = filtro === 'todos' ? true : filtro === 'disponivel' ? l.disponivel : !l.disponivel;
    const matchGenero = !genero || l.genero === genero;
    return matchBusca && matchStatus && matchGenero;
  });

  const confirmarEmprestimo = () => {
    const erros = validarEmprestimo(empForm);
    if (Object.keys(erros).length) { setEmpErros(erros); return; }
    onEmprestimo(modal.id, modal.titulo, empForm.leitor, empForm.dataDevolucao);
    setModal(null);
    setEmpForm({ leitor: '', dataDevolucao: '' });
    setEmpErros({});
    toast(`"${modal.titulo}" emprestado para ${empForm.leitor}! 🔖`, 'success');
  };

  const handleDevolucao = (livroId, titulo) => {
    const emp = emprestimos.find(e => e.livroId === livroId && !e.devolvido);
    if (emp) { onDevolucao(emp.id); toast(`"${titulo}" devolvido! ✅`, 'info'); }
  };

  const handleRemover = (livro) => {
    if (!window.confirm(`Remover "${livro.titulo}" do acervo?`)) return;
    onRemover(livro.id);
    toast(`"${livro.titulo}" removido.`, 'error');
  };

  return (
    <div>
      <h1 className="section-title">📚 Acervo</h1>
      <div className="search-bar">
        <input placeholder="🔍  Buscar por título, autor ou ISBN..." value={busca} onChange={e => setBusca(e.target.value)} />
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="disponivel">Disponíveis</option>
          <option value="emprestado">Emprestados</option>
        </select>
        <select value={genero} onChange={e => setGenero(e.target.value)}>
          <option value="">Todos os gêneros</option>
          {GENEROS.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>{filtrados.length} livro(s) encontrado(s)</p>
      {filtrados.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>Nenhum livro encontrado</h3>
          <p>Tente ajustar os filtros ou cadastre novos livros.</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtrados.map(livro => (
            <div key={livro.id} className="book-card">
              <Badge disponivel={livro.disponivel} />
              <div className="book-title">{livro.titulo}</div>
              <div className="book-meta">✍️ {livro.autor}</div>
              <div className="book-meta">📅 {livro.ano} · {livro.genero}</div>
              {livro.editora && <div className="book-meta">🏢 {livro.editora}</div>}
              <div className="book-meta">🔖 ISBN: {livro.isbn}</div>
              {livro.sinopse && (
                <div className="book-meta" style={{ fontStyle: 'italic', marginTop: '.25rem' }}>
                  {livro.sinopse.slice(0, 120)}{livro.sinopse.length > 120 ? '…' : ''}
                </div>
              )}
              <div className="book-actions">
                {livro.disponivel ? (
                  <button className="btn-primary" style={{ flex: 1, padding: '.4rem' }} onClick={() => setModal(livro)}>📤 Emprestar</button>
                ) : (
                  <button className="btn-warning" style={{ flex: 1, padding: '.4rem' }} onClick={() => handleDevolucao(livro.id, livro.titulo)}>📥 Devolver</button>
                )}
                <button className="btn-secondary" style={{ padding: '.4rem .75rem' }} onClick={() => onEditar(livro)}>✏️</button>
                <button className="btn-danger"    style={{ padding: '.4rem .75rem' }} onClick={() => handleRemover(livro)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-title">📤 Emprestar: {modal.titulo}</div>
            <FormGroup label="Nome do Leitor *" error={empErros.leitor}>
              <input value={empForm.leitor} placeholder="Nome completo..."
                onChange={e => { setEmpForm(p => ({ ...p, leitor: e.target.value })); setEmpErros(p => ({ ...p, leitor: '' })); }} />
            </FormGroup>
            <div className="mt-1">
              <FormGroup label="Data de Devolução *" error={empErros.dataDevolucao}>
                <input type="date" value={empForm.dataDevolucao}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setEmpForm(p => ({ ...p, dataDevolucao: e.target.value })); setEmpErros(p => ({ ...p, dataDevolucao: '' })); }} />
              </FormGroup>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button className="btn-primary"   onClick={confirmarEmprestimo}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Emprestimos({ emprestimos, livros, onDevolucao }) {
  const [filtro, setFiltro] = useState('ativos');
  const toast = useToast();

  const lista = emprestimos.filter(e =>
    filtro === 'ativos'     ? !e.devolvido :
    filtro === 'devolvidos' ?  e.devolvido :
    true
  );

  const isAtrasado = (e) => !e.devolvido && new Date(e.dataDevolucao) < new Date();
  const fmt = (iso) => new Date(iso).toLocaleDateString('pt-BR');

  const handleDevolver = (e) => {
    onDevolucao(e.id);
    toast(`"${e.tituloLivro}" devolvido! ✅`, 'info');
  };

  return (
    <div>
      <h1 className="section-title">🔄 Empréstimos</h1>
      <div className="search-bar">
        <select value={filtro} onChange={e => setFiltro(e.target.value)}>
          <option value="ativos">Ativos</option>
          <option value="devolvidos">Devolvidos</option>
          <option value="todos">Todos</option>
        </select>
      </div>
      {lista.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Nenhum empréstimo neste filtro</h3>
        </div>
      ) : (
        <div className="loan-list">
          {lista.map(e => (
            <div key={e.id} className={`loan-item ${isAtrasado(e) ? 'overdue' : ''}`}>
              <div className="loan-info">
                <div className="loan-title">📖 {e.tituloLivro}</div>
                <div className="loan-sub">👤 {e.leitor}</div>
                <div className="loan-sub">
                  📅 Emprestado: {fmt(e.dataEmprestimo)} · Devolução: {fmt(e.dataDevolucao)}
                  {isAtrasado(e) && <strong style={{ color: '#c0392b', marginLeft: '.5rem' }}>⚠ ATRASADO</strong>}
                  {e.devolvido && <span style={{ color: '#155724', marginLeft: '.5rem' }}>✓ Devolvido em {fmt(e.devolvidoEm)}</span>}
                </div>
              </div>
              {!e.devolvido && (
                <button className="btn-warning" onClick={() => handleDevolver(e)}>📥 Devolver</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [pagina,   setPagina]   = useState('dashboard');
  const [editando, setEditando] = useState(null);
  const { livros, cadastrar, remover, atualizar } = useLivros();
  const { emprestimos, emprestar, devolver }       = useEmprestimos();

  useEffect(() => {
    livros.forEach(l => {
      const temAtivo = emprestimos.some(e => e.livroId === l.id && !e.devolvido);
      if (temAtivo  &&  l.disponivel) atualizar(l.id, { disponivel: false });
      if (!temAtivo && !l.disponivel) atualizar(l.id, { disponivel: true });
    });
  }, [emprestimos]);

  const handleEditar    = (livro)     => { setEditando(livro); setPagina('cadastro'); };
  const handleAtualizar = (id, dados) => { atualizar(id, dados); setEditando(null); setPagina('acervo'); };

  const navItems = [
    { id: 'dashboard',   label: '🏠 Início'     },
    { id: 'cadastro',    label: '➕ Cadastrar'   },
    { id: 'acervo',      label: '📚 Acervo'      },
    { id: 'emprestimos', label: '🔄 Empréstimos' },
  ];

  return (
    <>
      <header className="header">
        <div className="header-brand"><span>📚</span> BiblioSystem</div>
        <nav className="nav">
          {navItems.map(n => (
            <button key={n.id} className={`nav-btn ${pagina === n.id ? 'active' : ''}`}
              onClick={() => { setPagina(n.id); if (n.id !== 'cadastro') setEditando(null); }}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {pagina === 'dashboard'   && <Dashboard livros={livros} emprestimos={emprestimos} />}

        {pagina === 'cadastro'    && (
          <CadastroLivro livros={livros} onCadastrar={cadastrar}
            editando={editando} onAtualizar={handleAtualizar}
            onCancelarEdicao={() => { setEditando(null); setPagina('acervo'); }} />
        )}

        {pagina === 'acervo'      && (
          <Acervo livros={livros} onRemover={remover} onEditar={handleEditar}
            emprestimos={emprestimos}
            onEmprestimo={(livroId, titulo, leitor, prazo) => {
              emprestar(livroId, titulo, leitor, prazo);
              atualizar(livroId, { disponivel: false });
            }}
            onDevolucao={(empId) => {
              const emp = emprestimos.find(e => e.id === empId);
              devolver(empId);
              if (emp) atualizar(emp.livroId, { disponivel: true });
            }} />
        )}

        {pagina === 'emprestimos' && (
          <Emprestimos emprestimos={emprestimos} livros={livros}
            onDevolucao={(empId) => {
              const emp = emprestimos.find(e => e.id === empId);
              devolver(empId);
              if (emp) atualizar(emp.livroId, { disponivel: true });
            }} />
        )}
      </main>

      <footer className="footer">
        BiblioSystem © {new Date().getFullYear()} — Atividade Avaliativa Final · UniCesumar · Engenharia de Software
      </footer>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ToastProvider>
    <App />
  </ToastProvider>
);