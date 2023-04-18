const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");
const PORT = 5555;
let infoUtilisateur;
let utilisateurconnecter ="";

// connexion à la base de données MariaDB
const session = require('express-session')
const mariadb = require ("mariadb");
const { connect } =require('http2');
const db = mariadb.createPool({
  host:'localhost',
  user:'root',
  password:'root',
  database:'siochat'
})

// fonction pour récupérer les informations utilisateur depuis la base de données
async function getUser(username, password) {
  let conn;
  try{
    conn = await db.getConnection();
    const rows = await conn.query("SELECT * FROM user WHERE Name = ? AND mdp = ?",[username, password]);
    return rows.length > 0 ? rows[0] : null;
  }catch (err){
      console.log("erreur : "+err);
      return null;
  }finally{
    if (conn) conn.release();
  }

}

const connectedUsers = new Set();

server.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ' + PORT);
});

// initialisation de la session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// middleware pour analyser le corps de la requête en tant que JSON
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended : true }));

// route pour la connexion de l'utilisateur
app.post('/login',async (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await getUser(username, password);
  if(user){
    infoUtilisateur = {
      pseudo: username,
      mail: user.mail
    };
    utilisateurconnecter = infoUtilisateur.pseudo;
    req.session.loggedin =true;

    res.redirect("/acceuil");
  }else{
    res.redirect("/erreur");
  }
});

// Route vers la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'connexion.html'));
});

// route pour la page d'accueil de l'utilisateur connecté
app.get('/acceuil', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// route pour la page d'erreur
app.get('/erreur', (req, res) => {
  res.sendFile(path.join(__dirname, 'error.html'));
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
  socket.nickname = utilisateurconnecter
  io.fetchSockets().then((room) => {
    var utilisateurs=[];
    room.forEach((item) => {
       utilisateurs.push({
        id_client: item.id,
        pseudo_client: item.nickname,

      });
  });
  io.emit('reception_utilisateur', utilisateurs);
  console.table(utilisateurs);
  /*socket.nickname=utilisateurconnecter;
  // Ajouter l'utilisateur connecté à la liste des utilisateurs connectés
  connectedUsers.add(socket.id);
  io.emit('update_users_count', Object.keys(io.sockets.sockets).length);
  // Envoyer la liste des utilisateurs connectés à tous les clients
  io.emit('connectedUsers', Array.from(connectedUsers));
  socket.on('set-pseudo', (pseudo) => {
    // Vérifier si le pseudo est vide
    if (!pseudo) {
      pseudo = 'User';
    }
    // Vérifier si le pseudo existe déjà
    let count = 1;
    let newPseudo = pseudo;
    while (connectedUsers.has(newPseudo)) {
      count++;
      newPseudo = `${pseudo}${count}`;
    }
    // Attribuer le nouveau pseudo
    socket.nickname=utilisateurconnecter;
    connectedUsers.add(newPseudo);
    console.log(`${newPseudo} vient de se connecter à ${new Date()}`);
    const utilisateurs = getUsers(io);
    console.table(utilisateurs);
    io.emit('reception_utilisateur', utilisateurs);
    io.emit('update_users_count', Object.keys(io.sockets.sockets).length);
    io.emit('connectedUsers', Array.from(connectedUsers));*/
  });

  // Emission du message
  socket.on('emission_message', (message) => {
    console.log(message)
    socket.broadcast.emit('reception_message', message)
    socket.emit('reception_message', message);
  });

  // Deconnexion de l'utilisateur
  socket.on('disconnect', () => {
    console.log(`${socket.nickname} s'est déconnecté à ${new Date()}.`);
    const utilisateurs = getUsers(io);
    console.table(utilisateurs);
    io.emit('reception_utilisateur', utilisateurs);
    connectedUsers.delete(socket.id);
    io.emit('connectedUsers', Array.from(connectedUsers));
  });

  io.emit('room', Object.keys(io.sockets.sockets).length);

});

// Retourne un tableau d'objets avec l'id et pseudo de chaque client connecté sur Socket.io
function getUsers(io) {
  const utilisateurs = [];
  io.sockets.sockets.forEach((socket) => {
    if (socket.nickname) {
      utilisateurs.push({
        id_client: socket.id,
        pseudo_client: socket.nickname,
      });
    } else {
      utilisateurs.push({
        id_client: socket.id,
        pseudo_client: 'Pseudo vide ou non défini',
      });
    }
  });
  return utilisateurs;
}
