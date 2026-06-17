# 📚 BiblioSystem — Sistema de Gerenciamento de Biblioteca

> Atividade Avaliativa Final — UniCesumar · Campus Ponta Grossa  
> Curso: Engenharia de Software · 3º Período

---

## 📖 Descrição

Sistema web para **cadastro e consulta de livros** de uma biblioteca, com controle de empréstimos e devolução. Desenvolvido com HTML5 semântico, CSS moderno e React 18 (via CDN + Babel standalone), sem necessidade de build tools.

---

## ✅ Requisitos Atendidos

### 1. Estrutura e Layout
- **HTML5 semântico**: uso de `<header>`, `<main>`, `<footer>`, `<nav>`
- **Box Model**: padding, margin e border aplicados em cards, formulários e botões
- **Flexbox**: navegação (`.nav`), formulários (`.form-group`), ações de cards (`.book-actions`)
- **CSS Grid Layout**: grid de livros (`.books-grid`), estatísticas (`.stats-grid`), formulário (`.form-grid`)
- **Media Queries**: responsividade total para mobile (`max-width: 768px`, `480px`) e `prefers-reduced-motion`

### 2. Estilo e Componentização
- **Design System próprio**: tokens de design via CSS Custom Properties (`--ink`, `--teal`, `--gold`…)
- **Styled Components equivalente**: classes reutilizáveis seguindo o padrão BEM-like (`.btn-primary`, `.book-card`, `.stat-card`)
- **Componentização React**: `FormGroup`, `Badge`, `Dashboard`, `CadastroLivro`, `Acervo`, `Emprestimos`, `ToastProvider`
- **Design System principles**: tipografia `Georgia` (display) + `Segoe UI` (corpo), escala tipográfica, paleta consistente

### 3. Interatividade e Lógica
- **Validação de formulários** com JavaScript puro: `validarLivro()`, `validarEmprestimo()` — sem bibliotecas externas
- **Manipulação de Eventos e Listeners**: `onChange`, `onKeyDown`, `onClick` em todos os formulários e botões
- **LocalStorage**: persistência de livros (`biblioteca_livros`) e empréstimos (`biblioteca_emprestimos`) — helper `Storage.get/set`
- **Fetch API + JSON**: integração com a [Open Library API](https://openlibrary.org) para busca de livros externos, com tratamento de erro

### 4. Desenvolvimento com React
- **Componentes funcionais** com Props
- **useState** para estado local de formulários, buscas, filtros e modais
- **useEffect** para sincronização de disponibilidade de livros com empréstimos
- **useCallback** para otimização de handlers
- **useContext** para contexto global de notificações (Toast)
- **Hooks customizados**: `useLivros()`, `useEmprestimos()`, `useToast()`
- **Virtual DOM** gerenciado pelo React
- **Roteamento** simulado via estado (SPA de arquivo único — sem servidor necessário)

### 5. Boas Práticas
- Código organizado em seções comentadas
- Separação de responsabilidades por componente/hook
- Nomenclatura em português para o domínio, inglês para padrões técnicos
- README completo com instruções de instalação e execução

---

## 🚀 Como Executar

### Opção 1 — Abertura direta (recomendada para demonstração)
```bash
# Simplesmente abra o arquivo no navegador:
open index.html
# ou arraste o arquivo para o Chrome/Firefox/Edge
```

> ⚠️ A busca na Open Library requer conexão com a internet.

### Opção 2 — Servidor local (para evitar restrições CORS em alguns navegadores)
```bash
# Com Python 3:
python3 -m http.server 3000
# Acesse: http://localhost:3000

# Com Node.js (npx):
npx serve .
```

---

## 🗂 Funcionalidades

| Módulo | Funcionalidade |
|--------|---------------|
| **Dashboard** | Estatísticas do acervo, frase literária aleatória, busca via Open Library API |
| **Cadastrar** | Formulário com validação completa, edição de livros existentes |
| **Acervo** | Grid de livros com busca, filtro por status e gênero, registro de empréstimos e devoluções |
| **Empréstimos** | Histórico completo, destaque de itens atrasados, registrar devolução |

---

## 🛠 Tecnologias Utilizadas

- HTML5 (semântico)
- CSS3 (Flexbox, Grid, Custom Properties, Media Queries, Animations)
- JavaScript ES2022 (async/await, optional chaining, destructuring)
- React 18 (CDN)
- React Babel Standalone (transpilação JSX no browser)
- Web Storage API (localStorage)
- Fetch API
- Open Library REST API (https://openlibrary.org)

---

## 👥 Equipe

- Alunos:
Arthur Pacher Santos, Gabriel Cesar Marteloti da Luz, Ketely Hornns Duarte Vicente, Pedro Henrique Antunes Pereira

- Curso: Engenharia de Software — 3º Período
- Instituição: UniCesumar — Campus Ponta Grossa

---

## 📄 Licença

Projeto acadêmico — uso restrito à atividade avaliativa.
