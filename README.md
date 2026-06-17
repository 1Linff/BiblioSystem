# BiblioSystem - Sistema de Gerenciamento de Biblioteca

Trabalho desenvolvido para a Atividade Avaliativa Final do curso de Engenharia de Software (3º Período) da UniCesumar - Campus Ponta Grossa.

---

## Sobre o Projeto

O BiblioSystem é um sistema web para o controle de acervo de uma biblioteca. Ele permite cadastrar livros, consultar o acervo, e registrar empréstimos e devoluções. O projeto foi construído utilizando HTML, CSS e React (importado via CDN com Babel standalone), o que significa que ele roda diretamente no navegador sem a necessidade de configurar ferramentas complexas como Vite ou Webpack.

---

## Requisitos Implementados

O desenvolvimento do sistema atendeu aos seguintes pontos exigidos na atividade:

**1. Estrutura Visual e Layout**
- Utilizamos HTML5 semântico para a estruturação da página (tags header, main, footer, nav).
- O layout é responsivo (adapta para telas menores) e foi construído utilizando CSS Flexbox e Grid Layout para organizar os elementos da tela e a lista de livros.
- O CSS foi modularizado e dividido em arquivos diferentes (geral, layout e componentes) para facilitar a manutenção.

**2. Lógica e Interatividade (JavaScript puro)**
- Toda a validação dos formulários (verificação de campos vazios, tamanho de ISBN, datas) foi feita manualmente com JavaScript.
- Os dados do sistema, como os livros cadastrados e o histórico de empréstimos, são salvos no LocalStorage do navegador.
- Fizemos uma integração com a API pública da Open Library utilizando a Fetch API. Isso permite pesquisar livros reais no Dashboard.

**3. Desenvolvimento com React**
- A interface foi construída dividindo as partes do sistema em componentes funcionais utilizando Props.
- Fizemos o gerenciamento de estado e ciclo de vida usando os hooks do React (`useState`, `useEffect`, `useCallback` e `useContext`).
- A navegação entre as telas do sistema foi feita simulando um roteamento através do estado do React.

---

## Funcionalidades do Sistema

- **Início (Dashboard):** Tela inicial com as estatísticas do sistema e um campo de busca para consultar livros na base de dados mundial da Open Library.
- **Cadastrar:** Formulário completo para a entrada de novos livros no sistema, e que também serve para editar informações de livros já salvos.
- **Acervo:** Lista geral mostrando todos os livros. Possui filtros por status (disponível/emprestado) e opções rápidas para registrar o empréstimo ou devolver um livro.
- **Empréstimos:** Histórico mostrando quem alugou cada livro, datas de devolução e indicativo visual caso algum empréstimo esteja atrasado.

---

## Como Executar o Projeto

A forma mais recomendada de rodar o projeto é utilizando um servidor local. Como o sistema faz requisições a arquivos externos (importação dos arquivos JS) e consome uma API da internet, abrir o arquivo dando apenas dois cliques pode fazer com que o navegador bloqueie a tela por questões de segurança (CORS).

**Passo a passo com o VS Code:**
1. Abra a pasta do projeto no Visual Studio Code.
2. Instale a extensão "Live Server".
3. Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

*(Alternativa via terminal)*:
Se tiver o Node.js ou Python instalados, abra o terminal na pasta do projeto e rode um dos comandos abaixo:
- Node: `npx serve .`
- Python: `python -m http.server 3000`

---

## Equipe

- Arthur Pacher Santos
- Gabriel Cesar Marteloti da Luz
- Ketely Hornns Duarte Vicente
- Pedro Henrique Antunes Pereira

**Instituição:** UniCesumar — Campus Ponta Grossa
**Curso:** Engenharia de Software — 3º Período
