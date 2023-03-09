var socket = io();

socket.emit('set-pseudo', prompt("Pseudo ?"));

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Empêche la page de se recharger
    socket.emit('emission_message', input.value);
    input.value = ''; // Efface le champ de saisie
});


socket.on('connect', () => {
    console.log("Connecté au serveur !");
});

socket.on('room', (room) => {
    console.log("Il y'a " + room +" utilisateurs");
    socket.room = room;
});

socket.on('disconnect', () => {
    console.log("Déconnecté du serveur !");
});

socket.on('set-pseudo',(pseudo)=>{
    console.log(pseudo + " vient de se connecter le "+new Date());
    socket.nickname = pseudo;
  
});

socket.on('reception_message', (contenu) => {
    var message = document.createElement('li');
    message.textContent = contenu;
    messages.appendChild(message);
  });

var id_salon='salon';
var lesMessages = [];

function salon(id) {
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
  