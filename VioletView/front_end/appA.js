document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  const resultsContainer = document.getElementById('results');

  if (query) {
    fetchMovies(query);
  }

  function fetchMovies(query) {
    const omdbApiKey = '2d83b506';
    fetch(`http://www.omdbapi.com/?s=${query}&apikey=${omdbApiKey}`)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          displayResults(data.Search);
        } else {
          resultsContainer.textContent = 'Nenhum filme encontrado.';
        }
      })
      .catch(error => {
        console.error('Erro ao buscar filmes:', error);
        resultsContainer.textContent = 'Erro ao buscar filmes. Por favor, tente novamente mais tarde.';
      });
  }

  function displayResults(movies) {
    resultsContainer.innerHTML = '';

    if (movies && movies.length > 0) {
      let row = document.createElement('div');
      row.classList.add('movie-row');
      movies.forEach((movie, index) => {
        if (index > 0 && index % 5 === 0) {
          resultsContainer.appendChild(row);
          row = document.createElement('div');
          row.classList.add('movie-row');
        }
        const movieElement = createMovieElement(movie);
        row.appendChild(movieElement);
      });
      resultsContainer.appendChild(row); // Adiciona a última linha
    } else {
      resultsContainer.textContent = 'Nenhum filme encontrado.';
    }
  }

  function createMovieElement(movie) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie-container');
    movieElement.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'img/no-image.png'}" alt="${movie.Title} Poster">
      <div class="movie-details">
        <h2>${movie.Title}</h2>
        <p><strong style="color: #E61D00;">Lançamento:</strong> ${movie.Year}</p>
        <p><strong style="color: #E61D00;">Tipo:</strong> ${movie.Type}</p>
        <button onclick="showMovieDetails('${movie.imdbID}')">Ver Detalhes</button>
      </div>
    `;
    return movieElement;
  }

  window.showMovieDetails = async function (imdbID) {
    try {
      const response = await fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=2d83b506`);
      const movieData = await response.json();

      alert(`Detalhes de ${movieData.Title}:
          Lançamento: ${movieData.Released}
          Gênero: ${movieData.Genre}
          Enredo: ${movieData.Plot}
          Duração: ${movieData.Runtime}
      `);
    } catch (error) {
      console.error('Erro ao obter detalhes do filme:', error);
    }
  };
});

function handleSearch(event) {
  event.preventDefault();
  const query = document.querySelector('input[name="query"]').value;
  window.location.href = `pesquisa.html?query=${query}`;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////

const arrows = document.querySelectorAll(".arrow");
const movieLists = document.querySelectorAll(".movie-list");


arrows.forEach((arrow, i) => {
  const itemNumber = movieLists[i].querySelectorAll("img").length;
  let clickCounter = 0;
  arrow.addEventListener("click", () => {
    const ratio = Math.floor(window.innerWidth / 270);
    clickCounter++;
    if (itemNumber - (4 + clickCounter) + (4 - ratio) >= 0) {
      movieLists[i].style.transform = `translateX(${
        movieLists[i].computedStyleMap().get("transform")[0].x.value - 300
      }px)`;
    } else {
      movieLists[i].style.transform = "translateX(0)";
      clickCounter = 0;
    }
  });

  console.log(Math.floor(window.innerWidth / 270));
});

let card = document.querySelector(".card");
let displayPicture = document.querySelector(".display-picture");

displayPicture.addEventListener("click", function(event) {
  // event.stopPropagation(); // Impede que o evento de clique se propague para o documento
  card.classList.toggle("hidden");
});

document.addEventListener("click", function(event) {
  // Verifica se o clique ocorreu fora do card e displayPicture
  if (!card.contains(event.target) && !displayPicture.contains(event.target)) {
    card.classList.add("hidden");
  }
});

// Adicionando um ouvinte de clique ao botão de sair dentro do card
document.querySelector(".card li:last-child").addEventListener("click", function(event) {
  // Isso impede que o clique no botão de sair propague para o documento
  event.stopPropagation();
});



document.addEventListener('DOMContentLoaded', function() {
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    const userInfo = JSON.parse(userInfoString);

    // Formata a data de nascimento (removendo a parte da hora)
    const birthDate = new Date(userInfo.dat_nascimento).toLocaleDateString('pt-BR');

    // Preenche os campos do formulário no modal de perfil
    document.getElementById('name').value = userInfo.nome;
    document.getElementById('email').value = userInfo.email;
    document.getElementById('password').value = userInfo.senha;
    document.getElementById('birthdate').value = birthDate; // Utiliza a data formatada
  }
});

function enableEditMode() {
  // Habilita a edição dos campos do formulário
  if (document.getElementById('name').disabled == true && document.getElementById('email').disabled == true && document.getElementById('password').disabled == true && document.getElementById('birthdate').disabled == true) {
    document.getElementById('name').disabled = false;
    document.getElementById('email').disabled = false;
    document.getElementById('password').disabled = false;
    document.getElementById('birthdate').disabled = false;
  } else if (document.getElementById('name').disabled == false &&
  document.getElementById('email').disabled == false &&
  document.getElementById('password').disabled == false
&&  document.getElementById('birthdate').disabled == false) {
  document.getElementById('name').disabled = true;
    document.getElementById('email').disabled = true;
    document.getElementById('password').disabled = true;
    document.getElementById('birthdate').disabled = true;
  }
  
  // Chama a função cad para alterar o valor do cadeado
  cad();
  senhaVisivel();
}


function cad() {
  // Muda o valor do conteúdo do elemento com o ID 'cadeado' para "🔓"
  if (document.getElementById('cadeado').textContent == '🔒') {
    document.getElementById('cadeado').textContent = '🔓';
  } else {
    document.getElementById('cadeado').textContent = '🔒';

  }
  
}

function senhaVisivel(){

  senha = document.getElementById('password')

  if (senha.type == 'password'){
      senha.type = 'text'
  } else {
      senha.type = 'password'
  }
}

///////////////////////////

function verificarlogin() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('password').value;

  // Não é necessário enviar um corpo no método GET, os parâmetros são incluídos na URL
  const url = `http://localhost:3000/login?email=${email}&senha=${senha}`;

  fetch(url, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(result => {
      if (result.autenticado) {
          alert('Login bem-sucedido!');
          const userInfo = result.userInfo;

          // Armazena as informações do usuário no localStorage
          localStorage.setItem('userInfo', JSON.stringify(userInfo));

          // Redirecionamento para outra página após o login
          window.location.href = 'index.html';
      } else {
          alert('Email ou senha incorretos.');
      }

      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
  })
  .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao processar o login.');
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
  });
}

// Cadastro do Usuário
function cadastrarUsuario() {
  const nome = document.getElementById('modalName').value;
  const email = document.getElementById('modalEmail').value;
  const datNascimento = document.getElementById('modalBirthdate').value;
  const senha = document.getElementById('modalPassword').value;

  // Verificação da idade
  const currentDate = new Date();
  const idade = currentDate.getFullYear() - new Date(datNascimento).getFullYear();

  if (idade < 18) {
    alert('Erro: O cliente deve ter no mínimo 18 anos.');
    return;
  }

  const data = {
    nome: nome,
    email: email,
    dat_nascimento: datNascimento,
    senha: senha,
  };

  fetch('http://localhost:3000/cadastro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      if (response.status === 400) {
        alert('Erro: O email já está cadastrado.');
        throw new Error('Email já cadastrado');
      }
      return response.json();
    })
    .then(result => {
      if (result) {
        alert('Cadastro Registrado!');
      }

      document.getElementById('modalName').value = '';
      document.getElementById('modalEmail').value = '';
      document.getElementById('modalBirthdate').value = '';
      document.getElementById('modalPassword').value = '';
    })
    .catch(error => {
      console.error('Erro:', error);

      document.getElementById('modalName').value = '';
      document.getElementById('modalEmail').value = '';
      document.getElementById('modalBirthdate').value = '';
      document.getElementById('modalPassword').value = '';
    });

  $('#cadastroModal').modal('hide');
}

// logout
function confirmarLogout() {
  var resposta = confirm("Você deseja realmente sair?")
  if (resposta) window.location.href = "login_cadastro.html"
}

// side bar
function w3_open() {
  document.getElementById("main").style.marginLeft = "12%";
  document.getElementById("mySidebar").style.width = "12%";
  document.getElementById("mySidebar").style.display = "block";
  document.getElementById("openNav").style.display = 'none';

  // Adiciona um event listener para fechar a sidebar ao clicar em qualquer lugar da tela
  document.body.addEventListener('click', w3_close);
}

function w3_close() {
  document.getElementById("main").style.marginLeft = "0%";
  document.getElementById("mySidebar").style.display = "none";
  document.getElementById("openNav").style.display = "inline-block";

  // Remove o event listener para fechar a sidebar ao clicar em qualquer lugar da tela
  document.body.removeEventListener('click', w3_close);
}

// Adiciona um event listener para impedir que o clique na sidebar propague para o corpo e feche imediatamente
document.getElementById("mySidebar").addEventListener('click', function (event) {
  event.stopPropagation();
});

// Adiciona um event listener ao botão de abertura para impedir que o clique nele propague para o corpo
document.getElementById("openNav").addEventListener('click', function (event) {
  event.stopPropagation();
});

// local modal

// Função para abrir o modal de perfil
function openProfileModal() {
  var modal = document.getElementById("profileModal");
  modal.style.display = "block";

}


// Função para fechar o modal de perfil
function closeProfileModal() {
  var modal = document.getElementById("profileModal");
  modal.style.display = "none";

  if (document.getElementById('name').disabled == false &&
  document.getElementById('email').disabled == false &&
  document.getElementById('password').disabled == false
&&  document.getElementById('birthdate').disabled == false) {
  document.getElementById('name').disabled = true;
    document.getElementById('email').disabled = true;
    document.getElementById('password').disabled = true;
    document.getElementById('birthdate').disabled = true;
    cad();
    senhaVisivel();
  }
  
}
// parte exclusão -------------------***************************-------------------

function updateProfile() {
  const userInfo = getUserInfo();

  if (userInfo) {
    const { id } = userInfo;
    const nome = document.getElementById('name').value;
    const senha = document.getElementById('password').value;
    const datNascimentoInput = document.getElementById('birthdate');
    const datNascimento = formatDateForServer(datNascimentoInput.value);
    const novoEmail = document.getElementById('email').value;

    const updatedData = {
      nome: nome,
      senha: senha,
      dat_nascimento: datNascimento,
      email: novoEmail
    };

    fetch(`http://localhost:3000/usuario/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    })
    .then(response => {
      if (response.ok) {
        console.log('Informações de perfil atualizadas com sucesso!');
        alert('Seus dados foram atualizados com sucesso!')
      } else {
        console.error('Erro ao atualizar as informações do perfil.');
      }
    })
    .catch(error => {
      console.error('Erro ao processar a solicitação:', error);
    });
  }
}

// Função para formatar a data no formato desejado para o servidor
function formatDateForServer(dateString) {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}


// Função para EXCLUSÃO
function confirmarExclusao() {
   
  const userInfo = getUserInfo();

  if (userInfo) {
    const { id } = userInfo;

    // Exibe uma caixa de diálogo de confirmação
    const confirmacao = confirm("Tem certeza que quer excluir sua conta?\n Está ação não poderá ser revertida!");

    // Se o usuário confirmar a exclusão
    if (confirmacao) {
      const senha = prompt("Sua conta será excluída permanentemente e todos os seus dados serão apagados! Digite sua senha para confirmar a exclusão:");

      // Se o usuário digitou a senha
      if (senha !== null) {
        const requestOptions = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ senha: senha }),
        };

        fetch(`http://localhost:3000/usuario/${id}`, requestOptions)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Erro ao excluir conta: ${response.status} - ${response.statusText}`);
            }
            return response.json();
          })
          .then(data => {
            console.log(data.mensagem); // Mensagem de sucesso do servidor
            alert('Sua conta foi excluída com sucesso!')
            window.location.href = "login_cadastro.html"
            // Aqui você pode redirecionar o usuário para a página de login, por exemplo
          })
          .catch(error => {
            console.error('Erro durante a exclusão:', error.message);
            // Aqui você pode lidar com erros, exibir mensagens de erro no frontend, etc.
            alert('Falha ao autenticar senha!')
          });
      } else {
        console.error('Senha não fornecida. Exclusão cancelada.');
      }
    } else {
      console.log('Exclusão cancelada pelo usuário.');
    }
  } else {
    console.error('Erro: Não foi possível obter as informações do usuário.');
  }
}

function getUserInfo() {
  const userInfoString = localStorage.getItem('userInfo');

  // Verifica se o userInfo foi obtido com sucesso
  if (!userInfoString) {
    console.error('Erro: Não foi possível obter as informações do usuário.');
    return null;
  }

  return JSON.parse(userInfoString);
}