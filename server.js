// Import dotenv with ES6 modules via https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
require('dotenv').config();
const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

// Create a express app
const app = express();
const port = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Set static file directory. Source: https://expressjs.com/en/starter/static-files.html
// Use Compression to enable GZIP compression
// Force HTTPS connection. Source: https://docs.divio.com/en/latest/how-to/node-express-force-https/
app
    .enable('trust proxy')
    .set('view engine', 'ejs')
    .use((request, response, next) => {

        if (process.env.NODE_ENV != 'development' && !request.secure) {
           return response.redirect("https://" + request.headers.host + request.url);
        }
    
        next();
    })
    .use(express.static('public'))
    .use(bodyParser.urlencoded({ extended: true }))
    .get("/", (req, res) => {
        res.render("index", { rtw: false, roomNum: uuidv4() });
    })
    .get("/room/:room", (req, res) => {
        res.render("join", { rtw: false, roomNum: req.params.room });
    })
    .post("/room/:room/play", (req, res) => {
        const user = req.body.username;
        if(user) {
            res.render("play", {rtw: true, userName: user});
        }
        else {
            res.redirect(`/room/${req.params.room}`);
        }        
    })
    .get("/room/:room/play", (req, res) => {
            res.redirect(`/room/${req.params.room}`);      
    })
    .get("*", (req, res) => {
        res.status(404).render("404",  { rtw: false });
    });

const game = [];

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('new-user', (object) => {
        const existingGame = game.map(game => game.roomId).indexOf(object.roomId);

        socket.userName = object.userName;

        socket.join(object.roomId);

        if(existingGame == -1) {
            console.log("Game bestaat niet > maak object aan");
            console.log(socket.userName);
            const toPush = { roomId: object.roomId, users:[{ userName: socket.userName, userId: socket.id }] };
            game.push(toPush);

            socket.emit('connected', "You connected");
            socket.emit('userlist', toPush.users);
        }
        else if(existingGame > -1) {
            console.log("Game bestaat wel");
            console.log(socket.userName);
            game[existingGame].users.push({ userName: socket.userName, userId: socket.id });
            
            socket.emit('connected', "You connected");
            socket.to(game[existingGame].roomId).emit('connected', `${socket.userName} connected.`);
            io.sockets.in(game[existingGame].roomId).emit('userlist', game[existingGame].users);
        }

        console.log(game);
        console.log(game[0].users);
    });
    
    socket.on('message', (message) => {
        console.log('message: ' + message);
        //io.emit('message', message);
    });
    
    socket.on('disconnecting', () => {
        const room = Array.from(socket.rooms)[1];
        const existingGame = game.map(game => game.roomId).indexOf(room);

        if(existingGame != -1) {
            const userList = game[existingGame].users.map(user => user.userId).indexOf(socket.id);
            game[existingGame].users.splice(userList, 1);
            
            socket.to(game[existingGame].roomId).emit('connected', `${socket.userName} disconnected.`);
            io.sockets.in(game[existingGame].roomId).emit('userlist', game[existingGame].users);  
            console.log(game[0].users);
        } 

        console.log('user disconnected');
        console.log(game);
    });
});
server.listen(port);
