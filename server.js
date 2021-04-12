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

    // When new user is connected 
    socket.on('new-user', (object) => {
        const existingGame = game.map(game => game.roomId).indexOf(object.roomId);

        socket.userName = object.userName;

        socket.join(object.roomId);

        // If game does not exist
        if(existingGame == -1) {
            console.log("Game bestaat niet > maak object aan");
            console.log(socket.userName);

            // Create game object 
            const toPush = { roomId: object.roomId, round: 1, questionPicker: 0, correctAnswer: '', users:[{ userName: socket.userName, userId: socket.id, points: 0 }] };
            game.push(toPush);

            socket.emit('connected', "You connected");
            socket.emit('questionPicker', { userInfo: toPush.users[toPush.questionPicker] });
            socket.emit('userlist', { users: toPush.users, questionPicker: toPush.questionPicker });
        }
        // If game does exist
        else if(existingGame > -1) {
            console.log("Game bestaat wel");
            console.log(socket.userName);
            const currentGame = game[existingGame];
            currentGame.users.push({ userName: socket.userName, userId: socket.id, points: 0 });

            if(currentGame.users.length === 1) {
                socket.emit('connected', "You connected");
                socket.emit('questionPicker', { userInfo: game[existingGame].users[0] });
            } else {
                socket.emit('connected', `You connected. ${currentGame.users[currentGame.questionPicker].userName} is the question picker.`);
            }
            
            socket.to(currentGame.roomId).emit('connected', `${socket.userName} connected.`);
            io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker });
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
            const currentGame = game[existingGame];
            const userIndex = currentGame.users.map(user => user.userId).indexOf(socket.id);
            
            // Remove user from Game data user array
            currentGame.users.splice(userIndex, 1);
            
            // Emit to all other sockets that this user left.
            socket.to(currentGame.roomId).emit('connected', `${socket.userName} disconnected.`);

            // If the leaving user was the question picker > make someone else the question picker
            if(currentGame.questionPicker === userIndex && userIndex != 0) {
                currentGame.questionPicker = 0;
                io.to(currentGame.users[0].userId).emit('questionPicker', { userInfo: currentGame.users[0] });
                socket.to(currentGame.roomId).emit('connected', `${currentGame.users[0].userName} is now the question picker!`);
            }

            // Update the scoreboard
            io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker });  
            
            console.log(game[0].users);
        } 

        console.log('user disconnected');
        console.log(game);
    });
});
server.listen(port);
