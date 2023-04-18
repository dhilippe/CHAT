// Connectez le client au serveur en créant un socket
var socket = io();

// Initialise les variables nécessaires
var chat_select = 'general';
var lesMessages = [];
var salonEnCours = document.getElementById('salon-en-cours');
var pseudo;

// Récupère le pseudonyme de l'utilisateur via le socket
(async () => {
  pseudo = await socket.nickname();
})();

var messages = document.getElementById('messages');
var button = document.getElementById('button');
var input = document.getElementById('input');
var numUtilisateurs = document.querySelector('#utilisateurs');
var listeUtilisateurs = document.getElementById("utilisateurs");
var bloquer = document.getElementById("bloquer");
var pseudoa = "";

// Ajoute un événement de clic au bouton d'envoi de message
button.addEventListener('click', (e) => {
  e.preventDefault()
  let message = {
    emetteur: pseudo, // Ajouter le pseudo dans l'objet de message
    dest: chat_select,
    content: input.value,
    date: new Date(),
    pseudo: pseudoa
  };
  // Émet le message via le socket
  socket.emit('emission_message', message);
  input.value = ''; // Efface le champ de saisie
});




// Gère l'événement de connexion au serveur
socket.on('connect', () => {
  console.log("Connecté au serveur !");
});

// Récupère la room dans laquelle se trouve l'utilisateur
socket.on('room', (room) => {
  socket.room = room;
});

// Gère l'événement de déconnexion du serveur
socket.on('disconnect', () => {
  // Supprime l'utilisateur de la liste des utilisateurs connectés
  $('#utilisateurs').find(`li:contains(${socket.nickname()})`).remove();
});

// Met à jour la liste des utilisateurs connectés
socket.on('reception_utilisateur', (utilisateurs) => {
  var nbUtilisateurs = utilisateurs.length;
  numUtilisateurs.textContent = "Il y a " + nbUtilisateurs + " utilisateur(s) connecté(s).";
  const userList = document.querySelector('#utilisateurs');
  userList.innerHTML="";
  userList.innerHTML = '<button class="button-user" id="button-user" onclick="salon(\'general\')">General</button>';



  utilisateurs.forEach(( (user) => {


    if(user.id !== socket.id && user.pseudo_client !=null && user.pseudo_client != undefined){

      var li2 = document.createElement('li');
      li2.innerHTML = `<button class="button-user" id="button-user" onclick="salon('${user.pseudo_client}')">${user.pseudo_client}</button>`;
      userList.appendChild(li2);
    }

    if (user.id_client == socket.id) {
      pseudoa = user.pseudo_client;
      var li = document.createElement('li');
      li.innerHTML = `<button class="button-user" id="button-user" onclick="salon('${user.pseudo_client}')">${user.pseudo_client}(you) </button>`;
      userList.appendChild(li);
    }





  }));
});

// Gère la réception de messages
socket.on('reception_message', (mes) => {
  lesMessages.push(mes);
  console.log(mes);
  messages.innerHTML = "";
  lesMessages.forEach(element => {
    var message = document.createElement("li");
    if (element.emetteur === pseudo && element.dest === chat_select) {
      console.log("d" + JSON.stringify(element));
      message.classList.add("envoye");
      console.log(element.emetteur);
      message.innerHTML = `
        <p class='pseudo-envoi'>${element.pseudo}</p>
        <p class='contenu'>${element.content}</p>
        <p class='date'>${element.date}</p>
      `;
    } else if (element.emetteur === chat_select && element.dest === pseudo) {
      message.classList.add("recu");
      message.innerHTML = `
        <p class='pseudo-envoi'>${element.emetteur}</p>
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

// fonction salon qui permet d'afficher les messages d'un salon spécifique
function salon(id) {

  // met à jour le titre du salon en cours

  salonEnCours.innerHTML = id;

  // met à jour le nom du salon

  document.getElementById('nom-salon').innerHTML = id;

  // vide le contenu des messages
  messages.innerHTML = '';

  // boucle à travers les messages et crée un élément div pour chaque message
  for(const contenu of lesMessages){
  if(
    (contenu.dest_id == id && id == 'general') ||
    (contenu.emet_id == socket.id && contenu.dest_id == socket.id) ||
    (contenu.emet_id == socket.id && contenu.dest_id == id)
  ){
    var div = document.createElement('div');
    if(contenu.emet_id == socket.id){
      div.setAttribute('class', 'message-emis');
    }else{
      div.setAttribute('class', 'message-recu');
    }
    div.innerHTML = contenu.contenu;
    messages.appendChild(div);
  }
  function salon(id) {

  // met à jour le titre du salon en cours

  salonEnCours.innerHTML = id;

  // met à jour le nom du salon

  document.getElementById('nom-salon').innerHTML = id;

  // vide le contenu des messages
  messages.innerHTML = '';

  // boucle à travers les messages et crée un élément div pour chaque message
  for(const contenu of lesMessages){


  if(
    (contenu.dest_id == id && id == 'general') ||
    (contenu.emet_id == socket.id && contenu.dest_id == socket.id) ||
    (contenu.emet_id == socket.id && contenu.dest_id == id)
  ){
    var div = document.createElement('div');
    if(contenu.emet_id == socket.id){
      div.setAttribute('class', 'message-emis');
    }else{
      div.setAttribute('class', 'message-recu');
    }
    div.innerHTML = contenu.contenu;
    messages.appendChild(div);
  }
}
  }

  // filtre les messages du salon spécifique
  var messages = lesMessages.filter(function (m) {
  return m.salon === id;
  });
  }

  // filtre les messages du salon spécifique
  var messages = lesMessages.filter(function (m) {
    return m.salon === id;
  });

  // récupère l'élément HTML où les messages seront affichés et vide son contenu
  var messagesElement = document.getElementById('messages');
  messagesElement.innerHTML = '';

  // pour chaque message, crée un élément HTML li et affiche son contenu dans le salon
  messages.forEach(function (m) {
    var message = document.createElement('li');
    message.textContent = m.contenu;
    messagesElement.appendChild(message);
  });
}

// fonction check_unread qui met à jour le badge affichant le nombre de messages non lus
function check_unread() {
  // initialise le nombre de messages non lus à 0
  var nbUnread = 0;

  // récupère l'élément HTML du badge et met à jour son contenu
  var badgeElement = document.getElementById('badge');
  badgeElement.textContent = nbUnread.toString();

  // affiche ou masque le badge en fonction du nombre de messages non lus
  badgeElement.style.display = (nbUnread > 0) ? 'block' : 'none';
}

// création d'un élément HTML span pour afficher le nombre d'utilisateurs dans le salon
const nbUsersElement = document.createElement('span');

// sélectionne l'élément HTML où le nombre d'utilisateurs sera affiché et ajoute l'élément HTML créé
document.querySelector('salon h3').appendChild(nbUsersElement);

// écouteur d'événements qui met à jour le nombre d'utilisateurs dans le salon
socket.on('update_users_count', (count) => {
  nbUsersElement.innerText = ` (${count})`;
});
