var socket = io();


var chat_select = 'general';
var lesMessages = []
var salonEnCours = document.getElementById('salon-en-cours')
var pseudo;
(async() => {
  pseudo = await socket.nickname
})();
var messages = document.getElementById('messages');
var button = document.getElementById('button');
var input = document.getElementById('input');
var numUtilisateurs = document.querySelector('#utilisateurs');
var listeUtilisateurs = document.getElementById("utilisateurs");

button.addEventListener('click', () => {
  let message = {
    emeteur: pseudo,  // Ajouter le pseudo dans l'objet de message
    dest: chat_select,
    content: input.value,
    date: new Date()
  }
  socket.emit('emission_message', message);
  input.value = ''; // Efface le champ de saisie
});

socket.on('connect', () => {
  console.log("Connecté au serveur !");
});

socket.on('room', (room) => {
  socket.room = room;
});

socket.on('disconnect', () => {
  $('#utilisateurs').find(`li:contains(${socket.nickname})`).remove();
});

socket.on('reception_utilisateur', (utilisateurs) => {
  var nbUtilisateurs = utilisateurs.length;
  numUtilisateurs.textContent = "Il y a " + nbUtilisateurs + " utilisateur(s) connecté(s).";
  var userList = document.querySelector('#utilisateurs');
  userList.innerHTML = `<button class="button-user id="button-user" onclick="salon('general')">General</button>`;
  utilisateurs.forEach(function (user) {
    var li = document.createElement('li');
    li.innerHTML = `<button class="button-user id="button-user" onclick="salon('${user.pseudo_client}')">${user.pseudo_client}</button>`;
    userList.appendChild(li);
  });
});

socket.on('reception_message', (mes) => {
  lesMessages.push(mes);
  console.log(mes)
  messages.innerHTML = "";
  lesMessages.forEach(element => {
    var message = document.createElement("li");
    if (element.emeteur === pseudo && element.dest === chat_select) {
      message.classList.add("envoye");
      console.log(element.emeteur);
      message.innerHTML = `
      <p class='recepteur'>${element.dest}</p>
      <p class='pseudo-envoi'>${element.emeteur}</p>
      <p class='contenu'>${element.content}</p>
      <p class='date'>${element.date}</p>`;
    }else if (element.emeteur === chat_select && element.dest === pseudo){
      message.classList.add("recu");
      message.innerHTML = `
      <p class='pseudo-envoi'>${element.emeteur}</p>
      <p class='contenu'>${element.content}</p>
      <p class='date'>${element.date}</p>`;
    }else if (element.emeteur === chat_select && element.dest === 'general') {
      message.classList.add("recu");
      message.innerHTML = `
      <p class='pseudo-envoi'>${element.emeteur}</p>
      <p class='contenu'>${element.content}</p>
      <p class='date'>${element.date}</p>`
    }
    messages.appendChild(message);
  });
});

function salon(id) {
  salonEnCours.innerHTML = id
  var messages = lesMessages.filter(function (m) {
    return m.salon === id;
  });

  var messagesElement = document.getElementById('messages');
  messagesElement.innerHTML = '';

  messages.forEach(function (m) {
    var message = document.createElement('li');
    message.textContent = m.contenu;
    messagesElement.appendChild(message);
  });
}

function check_unread() {
  var nbUnread = 0;

  var badgeElement = document.getElementById('badge');
  badgeElement.textContent = nbUnread.toString();
  badgeElement.style.display = (nbUnread > 0) ? 'block' : 'none';
}

const nbUsersElement = document.createElement('span');
document.querySelector('salon h3').appendChild(nbUsersElement);

socket.on('update_users_count', (count) => {
  nbUsersElement.innerText = ` (${count})`;
});
