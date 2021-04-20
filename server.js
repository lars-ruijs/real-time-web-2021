// Import dotenv with ES6 modules via https://github.com/motdotla/dotenv/issues/89#issuecomment-587753552
require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const { getData } = require('./modules/fetch');

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
    .post("/play", (req, res) => {
        res.redirect(`/room/${req.body.gamecode}`);
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

            socket.emit('server-message', { type: "connected", message: "You connected" });
            socket.emit('questionPicker', { userInfo: toPush.users[toPush.questionPicker] });
            socket.emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });
            socket.emit('userlist', { users: toPush.users, questionPicker: toPush.questionPicker, round: toPush.round });
        }
        // If game does exist
        else if(existingGame > -1) {
            console.log("Game bestaat wel");
            console.log(socket.userName);
            const currentGame = game[existingGame];
            currentGame.users.push({ userName: socket.userName, userId: socket.id, points: 0 });

            if(currentGame.users.length === 1) {
                socket.emit('server-message', { type: "connected", message: "You connected" });
                socket.emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });
                socket.emit('questionPicker', { userInfo: game[existingGame].users[0] });
            } else {
                socket.emit('server-message', { type: "connected", message: `You connected. ${currentGame.users[currentGame.questionPicker].userName} is the question picker.` });
            }
            
            socket.to(currentGame.roomId).emit('server-message', { type: "connected", message: `👋 ${socket.userName} connected.` });
            io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker, round: currentGame.round });
        }

        console.log(game);
        console.log(game[0].users);
    });
    
    socket.on('message', (message) => {
        const currentGame = game[getRoomInfo(socket)];
        const userIndex = getUserIndex(currentGame, socket);

        // Check if user is question picker
        if(userIndex === currentGame.questionPicker) {
            io.sockets.in(currentGame.roomId).emit('chat-message', { userName: socket.userName, message: message });
        } 
        else {
            // Check if message is the correct answer
            if(message.toLowerCase() === currentGame.correctAnswer) {
                currentGame.correctAnswer = '';
                currentGame.users[userIndex].points += 10;

                // To all users, except the current socket
                socket.to(currentGame.roomId).emit('server-message', { type: "correctAnswer", message: `🎉  ${socket.userName} guessed the answer (${message}) and gets +10 points!  🎉` });

                // To the current socket
                socket.emit('server-message', { type: "correctAnswer", message: "🎉  You guessed the answer! +10 points for you, good job!  🎉" });
                
                // If less than 5 rounds
                if(currentGame.round < 5) {
                    currentGame.round += 1;
                    const newQuestionPickerIndex = currentGame.questionPicker+1;

                    // Set new question picker
                    if(newQuestionPickerIndex < currentGame.users.length) {
                        currentGame.questionPicker += 1;
                    } else {
                        currentGame.questionPicker = 0;
                    }

                    // To the new question picker
                    io.to(currentGame.users[currentGame.questionPicker].userId).emit('questionPicker', { userInfo: currentGame.users[currentGame.questionPicker] });
                    io.to(currentGame.users[currentGame.questionPicker].userId).emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });

                    // To all users in this room
                    currentGame.users.map(user => user.userId).filter(userId => userId != currentGame.users[currentGame.questionPicker].userId).forEach(userId => {
                        io.to(userId).emit('server-message', { type: "newPicker", message: `👑 ${currentGame.users[currentGame.questionPicker].userName} is now the question picker!` });
                    });
                }
                else {
                    io.sockets.in(currentGame.roomId).emit('game-ended', { users: currentGame.users }); 
                    game.splice(getRoomInfo(socket), 1);
                }

                // To all users in the room > update the score board
                io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker, round: currentGame.round });  
            }
            else {
                // If the message is not the correct answer, just send it.
                io.sockets.in(currentGame.roomId).emit('chat-message', { userName: socket.userName, message: message });
            }
        }
    });

    socket.on('question-asked', async (questionObj) => {
        const currentGame = game[getRoomInfo(socket)];

        if(currentGame.users.length > 1) {
            // Check if all required fields are filled
            if(questionObj.answer && questionObj.hint1 && questionObj.hint2) {
                currentGame.correctAnswer = questionObj.answer.toLowerCase();
                const img1 = await getData(questionObj.hint1.toLowerCase());
                const img2 = await getData(questionObj.hint2.toLowerCase());
                //const img1 = { results: [{urls: {thumb: "https://images.unsplash.com/photo-1564980389771-36fba50a670d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMjI4MDR8MHwxfHNlYXJjaHwxfHxkcmlua2luZ3xlbnwwfHwxfHwxNjE4MzA2Mjkw&ixlib=rb-1.2.1&q=80&w=200"}}] };
                //const img2 = { results: [{urls: {thumb: "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMjI4MDR8MHwxfHNlYXJjaHwxfHxsYWtlfGVufDB8fDF8fDE2MTgzMDYyOTA&ixlib=rb-1.2.1&q=80&w=200"}}] };
    
                // If there are image results 
                if(img1.results[0] && img2.results[0]) {
                    io.sockets.in(currentGame.roomId).emit('start-round', { images: [img1.results[0].urls.thumb, img2.results[0].urls.thumb], userName: socket.userName });
                } 
                else {
                    socket.emit('server-message', { type: "error", message: "⚠️ No images could be found for the given keywords. Change your keywords and try again." });
                }
            }
            else {
                socket.emit('server-message', { type: "error", message: "⚠️ Not all the required fields were filled in. Make sure to include a subject and define two keywords to search images for." });
            }
        }
        else {
            socket.emit('server-message', { type: "error", message: "⚠️ Wait for other players before starting a round. At least one other player is required." });
        }

        console.log(currentGame.correctAnswer);
    });
    
    socket.on('disconnecting', () => {
        const existingGame = getRoomInfo(socket);

        if(existingGame != -1) {
            const currentGame = game[existingGame];
            const userIndex = getUserIndex(currentGame, socket);
            
            socket.leave(currentGame.roomId);

            if(userIndex != -1) {
                // Remove user from Game data user array
                currentGame.users.splice(userIndex, 1);
                
                // Emit to all other sockets that this user left.
                socket.to(currentGame.roomId).emit('server-message', { type: "disconnected", message: `➡️ ${socket.userName} disconnected.`});

                // If the leaving user was the question picker > make someone else the question picker
                if(currentGame.questionPicker === userIndex && currentGame.users.length != 0) {
                    currentGame.questionPicker = 0;
                    io.to(currentGame.users[0].userId).emit('questionPicker', { userInfo: currentGame.users[0] });
                    io.to(currentGame.users[0].userId).emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });
                    
                    // To all users in this room
                    currentGame.users.map(user => user.userId).filter(userId => userId != currentGame.users[currentGame.questionPicker].userId).forEach(userId => {
                        io.to(userId).emit('server-message', { type: "newPicker", message: `👑 ${currentGame.users[currentGame.questionPicker].userName} is now the question picker!` });
                    });
                }

                // Update the scoreboard
                io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker, round: currentGame.round });  
            }
        } 

        console.log('user disconnected');
        console.log(game);
    });
});

function getRoomInfo(socket) {
    const room = Array.from(socket.rooms)[1];
    const existingGame = game.map(game => game.roomId).indexOf(room);
    return existingGame;
}

function getUserIndex(currentGame, socket) {
    const userIndex = currentGame.users.map(user => user.userId).indexOf(socket.id);
    return userIndex;
}

server.listen(port);
