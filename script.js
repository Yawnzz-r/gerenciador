const api = 'http://localhost:3000/api';

// Função para escapar aspas em strings para evitar erro no innerHTML
function escapeQuotes(text) {
  if (!text) return '';
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// --- Funções para index.html ---

function cadastrar() {
  const nome = document.getElementById('cadastroNome').value.trim();
  const email = document.getElementById('cadastroEmail').value.trim();
  const senha = document.getElementById('cadastroSenha').value;

  if (!nome || !email || !senha) {
    alert('Por favor, preencha todos os campos do cadastro.');
    return;
  }

  fetch(`${api}/auth/cadastro`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome, email, senha })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mensagem);
  })
  .catch(() => alert('Erro ao cadastrar.'));
}

function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const senha = document.getElementById('loginSenha').value;

  if (!email || !senha) {
    alert('Por favor, preencha todos os campos do login.');
    return;
  }

  fetch(`${api}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, senha })
  })
  .then(res => res.json())
  .then(data => {
    if (data.usuario) {
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      window.location.href = 'tarefas.html';
    } else {
      alert(data.mensagem);
    }
  })
  .catch(() => alert('Erro ao fazer login.'));
}

// --- Funções para tarefas.html ---

if (window.location.pathname.includes('tarefas.html')) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const listaTarefas = document.getElementById('listaTarefas');
  const boasVindas = document.getElementById('boasVindas');

  if (!usuario) {
    window.location.href = 'index.html';
  }

  boasVindas.textContent = `Tarefas de ${usuario.nome}`;

  function carregarTarefas(filtro = 'todas') {
    fetch(`${api}/tarefas/${usuario.id}`)
      .then(res => res.json())
      .then(tarefas => {
        listaTarefas.innerHTML = '';

        let tarefasFiltradas;
        if (filtro === 'todas') {
          tarefasFiltradas = tarefas;
        } else {
          tarefasFiltradas = tarefas.filter(t => t.status === filtro);
        }

        if (tarefasFiltradas.length === 0) {
          listaTarefas.innerHTML = `<p>Nenhuma tarefa ${filtro === 'todas' ? '' : filtro} encontrada.</p>`;
          return;
        }

        tarefasFiltradas.forEach(t => {
          const div = document.createElement('div');
          div.className = 'tarefa';
          div.innerHTML = `
            <strong>${t.titulo}</strong>
            <p>${t.descricao ? t.descricao : '<em>Sem descrição</em>'}</p>
            <p>Status: <em>${t.status}</em></p>
            <button onclick="alternarStatus(${t.id}, '${t.status}')">Alternar Status</button>
            <button onclick="editarTarefa(${t.id}, '${escapeQuotes(t.titulo)}', '${escapeQuotes(t.descricao)}', '${t.status}')">Editar</button>
            <button onclick="deletarTarefa(${t.id})">Excluir</button>
          `;
          listaTarefas.appendChild(div);
        });
      })
      .catch(() => {
        listaTarefas.innerHTML = `<p>Erro ao carregar tarefas.</p>`;
      });
  }

  window.adicionarTarefa = function () {
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();

    if (!titulo) {
      alert('O título da tarefa é obrigatório.');
      return;
    }

    fetch(`${api}/tarefas`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ titulo, descricao, usuario_id: usuario.id })
    })
    .then(() => {
      document.getElementById('titulo').value = '';
      document.getElementById('descricao').value = '';
      carregarTarefas();
    })
    .catch(() => alert('Erro ao adicionar tarefa.'));
  }

  window.deletarTarefa = function (id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    fetch(`${api}/tarefas/${id}`, { method: 'DELETE' })
      .then(() => carregarTarefas())
      .catch(() => alert('Erro ao excluir tarefa.'));
  }

  window.alternarStatus = function (id, statusAtual) {
    const novoStatus = statusAtual === 'pendente' ? 'concluida' : 'pendente';

    // Buscar a tarefa para manter título e descrição
    fetch(`${api}/tarefas/${usuario.id}`)
      .then(res => res.json())
      .then(tarefas => {
        const tarefa = tarefas.find(t => t.id === id);
        if (!tarefa) {
          alert('Tarefa não encontrada');
          return;
        }

        fetch(`${api}/tarefas/${id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ titulo: tarefa.titulo, descricao: tarefa.descricao, status: novoStatus })
        }).then(() => carregarTarefas())
          .catch(() => alert('Erro ao atualizar status da tarefa.'));
      });
  }

  window.editarTarefa = function (id, titulo, descricao, status) {
    const novoTitulo = prompt('Novo título:', titulo);
    if (novoTitulo === null) return; // Cancelou

    const novaDescricao = prompt('Nova descrição:', descricao);
    if (novaDescricao === null) return; // Cancelou

    if (novoTitulo.trim() === '') {
      alert('Título não pode ser vazio.');
      return;
    }

    fetch(`${api}/tarefas/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ titulo: novoTitulo.trim(), descricao: novaDescricao.trim(), status })
    })
    .then(() => carregarTarefas())
    .catch(() => alert('Erro ao editar tarefa.'));
  }

  window.filtrarTarefas = function (status) {
    carregarTarefas(status);
  }

  carregarTarefas();
}
