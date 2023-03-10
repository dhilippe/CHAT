const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");

const PORT = 5555;

server.listen(PORT, () => {
    console.log('Serveur démarré sur le port : '+PORT);
});

// Route vers la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
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
io.on('connection',(socket)=>{
    socket.on('set-pseudo',(pseudo)=>{
        console.log(pseudo +" vient de se connecter à "+new Date());
        socket.nickname = pseudo;
        io.fetchSockets().then((room)=>{
            var utilisateurs=[];
            room.forEach((item) => {
                utilisateurs.push({
                    id_client : item.id,
                    pseudo_client : item.nickname,
                });
            });
            console.log("Voici les utilisateurs connectée : "+utilisateurs)
            console.table("Voici les utilisateurs connectée : "+utilisateurs.id_client + utilisateurs.pseudo_client)
            io.emit('reception_utilisateur', utilisateurs);
            console.table(utilisateurs)
        });
    });

// Emission du message
    socket.on('emission_message',(message)=>{
        io.emit('reception_message', `${socket.nickname}: ${message}`)
        console.log(socket.nickname+": '"+message+"' le "+new Date());
    });
// Deconnexion de l'utilisateur
    socket.on('disconnect',()=>{
        console.log(`${socket.nickname} s'est déconnecté à ${new Date()}.`);
    });
});



io.on('connection',(socket)=>{
    io.emit('room', Object.keys(io.sockets.sockets).length)
});
