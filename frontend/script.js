const API_URL = 'http://localhost:3000/auth';

// --- LÓGICA DE REGISTRO ---
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede a página de recarregar

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const resposta = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert('Conta criada com sucesso! Redirecionando para o login...');
        window.location.href = 'login.html'; // Redireciona o usuário
      } else {
        if (dados.erros) {
          alert('Erro de validação: ' + JSON.stringify(dados.erros));
        } else {
          alert(dados.erro || 'Erro ao registrar.');
        }
      }
    } catch (erro) {
      console.error(erro);
      alert('Não foi possível conectar ao servidor.');
    }
  });
}

// --- LÓGICA DE LOGIN ---
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem('token', dados.token);
        alert('Login realizado com sucesso! Redirecionando para o painel...');
        window.location.href = 'painel.html'; 
      } else {
        alert(dados.erro || 'E-mail ou senha incorretos.');
      }
    } catch (erro) {
      console.error(erro);
      alert('Não foi possível conectar ao servidor.');
    }
  }); // 👈 Aqui foi corrigido o fechamento do evento de login!
}

// --- LÓGICA DO PAINEL DE APARELHOS ---
const listaAparelhos = document.getElementById('listaAparelhos');

// Função para buscar os aparelhos do Back-end
async function carregarAparelhos() {
  const token = localStorage.getItem('token');
  
  // Segurança Básica: Se não tem token, chuta o usuário de volta para o login
  if (!token && window.location.pathname.includes('painel.html')) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/aparelhos', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}` // Envia o token exatamente como no Thunder Client!
      }
    });

    if (resposta.ok) {
      const aparelhos = await resposta.json();
      listaAparelhos.innerHTML = ''; // Limpa a tabela antes de desenhar

      aparelhos.forEach(aparelho => {
        listaAparelhos.innerHTML += `
          <tr>
            <td>${aparelho.nome}</td>
            <td>${aparelho.setor}</td>
            <td><strong>${aparelho.status}</strong></td>
            <td>
               <button class="btn-acao" style="background-color: #ffc107; color: black;">Editar</button>
            </td>
          </tr>
        `;
      });
    }
  } catch (erro) {
    console.error('Erro ao carregar aparelhos:', erro);
  }
}

// Lógica para Cadastrar Aparelho
const formAparelho = document.getElementById('formAparelho');
if (formAparelho) {
  formAparelho.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const nome = document.getElementById('nomeAparelho').value;
    const setor = document.getElementById('setorAparelho').value;
    const status = document.getElementById('statusAparelho').value;

    try {
      const resposta = await fetch('http://localhost:3000/aparelhos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, setor, status })
      });

      if (resposta.ok) {
        alert('Aparelho cadastrado com sucesso!');
        formAparelho.reset(); // Limpa os campos do formulário
        carregarAparelhos(); // Atualiza a tabela na hora sem atualizar a página!
      } else {
        alert('Erro ao cadastrar aparelho.');
      }
    } catch (erro) {
      console.error(erro);
    }
  });
}

// Botão Sair
const btnSair = document.getElementById('btnSair');
if (btnSair) {
  btnSair.addEventListener('click', () => {
    localStorage.removeItem('token'); // Apaga o token
    window.location.href = 'login.html'; // De volta para o início
  });
}

// Executa automaticamente a busca assim que a tela do painel carregar
if (listaAparelhos) {
  carregarAparelhos();
}