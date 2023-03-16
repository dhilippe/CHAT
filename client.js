var socket = io();

socket.emit('set-pseudo', prompt("Pseudo ?"));

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var numUtilisateurs = document.querySelector('#utilisateurs'); // ici, il faut sélectionner l'élément HTML qui a l'id "utilisateurs"
const listeUtilisateurs = document.getElementById("utilisateurs");


form.addEventListener('submit', (e) => {
  e.preventDefault(); // Empêche la page de se recharger
  socket.emit('emission_message', input.value);
  input.value = ''; // Efface le champ de saisie

});

socket.on('connect', () => {
  console.log("Connecté au serveur !");
});


socket.on('room', (room) => {
  console.log("Il y a " + room + " utilisateurs");
  socket.room = room;
});

socket.on('disconnect', () => {
  console.log("Déconnecté du serveur !");
});

socket.on('set-pseudo', (pseudo) => {
  console.log(pseudo + " vient de se connecter le " + new Date());
  socket.nickname = pseudo;
});

socket.on('reception_utilisateur', (utilisateurs) => {
  var nbUtilisateurs = utilisateurs.length;
  numUtilisateurs.textContent = "Il y a " + nbUtilisateurs + " utilisateur(s) connecté(s).";

  var userList = document.querySelector('#utilisateurs'); // ici, il faut sélectionner l'élément HTML qui a l'id "utilisateurs"
  userList.innerHTML = '';

  utilisateurs.forEach(function(user) {
    var li = document.createElement('li');
    li.textContent = user.pseudo_client;
    userList.appendChild(li);
  });
});

socket.on('reception_message', (contenu) => {
  var message = document.createElement('li');
  message.textContent = contenu;
  messages.appendChild(message);
});

// Créer un salon de discussion
socket.on('create-room', (room) => {
  socket.join(room);
});

// Rejoindre un salon de discussion
socket.on('join-room', (room) => {
  socket.join(room);
});

// Envoyer un message à tous les utilisateurs du salon
socket.on('message', (message) => {
  io.in(room).emit('message', message);

});

// Ajouter un utilisateur
socket.on('set-pseudo', (pseudo) => {
  socket.nickname = pseudo;
  $('#utilisateurs').append(`<li>${pseudo}</li>`);
});

// Retirer un utilisateur
socket.on('disconnect', () => {
  $('#utilisateurs').find(`li:contains(${socket.nickname})`).remove();
});


var id_salon = 'salon';
var lesMessages = [];

function salon(id) {
  var messages = lesMessages.filter(function(m) {
    return m.salon === id;
  });

  var messagesElement = document.getElementById('messages');
  messagesElement.innerHTML = '';

  messages.forEach(function(m) {
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
document.querySelector('#salon h3').appendChild(nbUsersElement);

socket.on('update_users_count', (count) => {
  nbUsersElement.innerText = ` (${count})`;
});
