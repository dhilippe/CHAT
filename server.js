const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const PORT = 5555;

server.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ' + PORT);
});

// Route vers la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route vers le fichier client.js
app.get('/client.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.js'));
});

// Route vers le fichier style.css
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// L'utilisateur se connecte
io.on('connection', (socket) => {
  socket.on('set-pseudo', (pseudo) => {
    console.log(pseudo + " vient de se connecter à " + new Date());
    socket.nickname = pseudo;
    const utilisateurs = getUsers(io);
    console.table(utilisateurs);
    io.emit('reception_utilisateur', utilisateurs);
  });

  // Emission du message
  socket.on('emission_message', (message) => {
    socket.broadcast.emit('reception_message', message)
    socket.emit('reception_message', message);
    console.log(socket.nickname + ": '" + message.content + "' le " + new Date());
  });

  // Deconnexion de l'utilisateur
  socket.on('disconnect', () => {
    console.log(`${socket.nickname} s'est déconnecté à ${new Date()}.`);
    const utilisateurs = getUsers(io);
    console.table(utilisateurs);
    io.emit('reception_utilisateur', utilisateurs);
  });

  io.emit('room', Object.keys(io.sockets.sockets).length);
});


function getUsers(io) {
  const utilisateurs = [];
  io.sockets.sockets.forEach((socket) => {
    if (socket.nickname) {
      utilisateurs.push({
        id_client: socket.id,
        pseudo_client: socket.nickname,
      });
    }
  });
  return utilisateurs;
}

const connectedUsers = new Set();

io.on('connection', (socket) => {
  // Ajouter l'utilisateur connecté à la liste des utilisateurs connectés
  connectedUsers.add(socket.id);
  io.emit('update_users_count', Object.keys(io.sockets.sockets).length);
  // Envoyer la liste des utilisateurs connectés à tous les clients
  io.emit('connectedUsers', Array.from(connectedUsers));

  // Gérer la déconnexion de l'utilisateur
  socket.on('disconnect', () => {
    // Supprimer l'utilisateur déconnecté de la liste des utilisateurs connectés
    connectedUsers.delete(socket.id);

    // Envoyer la liste des utilisateurs connectés mise à jour à tous les clients
    io.emit('connectedUsers', Array.from(connectedUsers));
  });
});
