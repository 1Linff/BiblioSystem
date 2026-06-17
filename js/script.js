const GENEROS = ['Romance','Ficção Científica','Fantasia','Terror','Mistério',
                 'Biografia','História','Ciência','Filosofia','Tecnologia','Outro'];

const QUOTES = [
  { text: 'Uma sala sem livros é como um corpo sem alma.', author: '— Cícero' },
  { text: 'Não existe navio que possa nos conduzir a uma viagem distante como um livro.', author: '— Emily Dickinson' },
  { text: 'Os livros são espelhos: só se vê neles o que já se tem dentro de si.', author: '— Carlos Ruiz Zafón' },
];

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json?title=';
const LIVRO_VAZIO = { titulo: '', autor: '', isbn: '', ano: '', editora: '', genero: '', sinopse: '' };

const Storage = {
  get: (key, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
};

function validarLivro(dados) {
  const erros = {};
  if (!dados.titulo?.trim())                                                erros.titulo  = 'Título é obrigatório.';
  else if (dados.titulo.trim().length < 2)                                  erros.titulo  = 'Título muito curto.';
  if (!dados.autor?.trim())                                                 erros.autor   = 'Autor é obrigatório.';
  if (!dados.isbn?.trim())                                                  erros.isbn    = 'ISBN é obrigatório.';
  else if (!/^\d{10}(\d{3})?$/.test(dados.isbn.replace(/-/g, '')))         erros.isbn    = 'ISBN deve ter 10 ou 13 dígitos.';
  if (!dados.ano?.trim())                                                   erros.ano     = 'Ano é obrigatório.';
  else if (isNaN(dados.ano) || +dados.ano < 1000 || +dados.ano > new Date().getFullYear())
                                                                            erros.ano     = 'Ano inválido.';
  if (!dados.genero)                                                        erros.genero  = 'Selecione um gênero.';
  return erros;
}

function validarEmprestimo(dados) {
  const erros = {};
  if (!dados.leitor?.trim())    erros.leitor        = 'Nome do leitor é obrigatório.';
  if (!dados.dataDevolucao)     erros.dataDevolucao = 'Data de devolução é obrigatória.';
  else if (new Date(dados.dataDevolucao) <= new Date()) erros.dataDevolucao = 'Data deve ser futura.';
  return erros;
}