const { getData, getRoomInfo, getUserIndex } = require('./helpers');

const game = [];

function useSockets(server) {
    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
    
        // When new user is connected 
        socket.on('new-user', (object) => {

            // Get game data index for current roomId
            const existingGame = game.map(game => game.roomId).indexOf(object.roomId);
    
            // Save the userName to this socket & join this room
            socket.userName = object.userName;
            socket.join(object.roomId);
    
            // If game does not exist
            if(existingGame == -1) {
    
                // Create game object & push it to game data array
                const toPush = { roomId: object.roomId, round: 1, questionPicker: 0, correctAnswer: '', users:[{ userName: socket.userName, userId: socket.id, points: 0 }] };
                game.push(toPush);
    
                // Emit a connected message > make this user the question picker > update the userlist (scoreboard)
                socket.emit('server-message', { type: "connected", message: "You connected" });
                socket.emit('questionPicker', { userInfo: toPush.users[toPush.questionPicker] });
                socket.emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });
                socket.emit('userlist', { users: toPush.users, questionPicker: toPush.questionPicker, round: toPush.round });
            }
            // If game does exist
            else if(existingGame > -1) {
                // Get game data for this room
                const currentGame = game[existingGame];

                // Add this user to the game data for this room
                currentGame.users.push({ userName: socket.userName, userId: socket.id, points: 0 });
    
                // If it's the first user > make him/her the question picker
                if(currentGame.users.length === 1) {
                    socket.emit('server-message', { type: "connected", message: "You connected" });
                    socket.emit('server-message', { type: "pickerInfo", message: "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints." });
                    socket.emit('questionPicker', { userInfo: game[existingGame].users[0] });
                } else {
                    socket.emit('server-message', { type: "connected", message: `You connected. ${currentGame.users[currentGame.questionPicker].userName} is the question picker.` });
                }
                
                // Send connected message to others and update userlist for everyone in this room
                socket.to(currentGame.roomId).emit('server-message', { type: "connected", message: `👋 ${socket.userName} connected.` });
                io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker, round: currentGame.round });
            }
        });
        
        // When a message was sent
        socket.on('message', (message) => {
            // Get game data for this room & index of user in the user array
            const currentGame = game[getRoomInfo(socket, game)];
            const userIndex = getUserIndex(currentGame, socket);

            if(currentGame) {
                // Check if user is question picker > send message to all sockets in the room
                if(userIndex === currentGame.questionPicker) {
                    io.sockets.in(currentGame.roomId).emit('chat-message', { userName: socket.userName, message: message });
                } 
                else {
                    // Check if message is the correct answer
                    if(message.toLowerCase() === currentGame.correctAnswer) {
                        // Set correctAnswer to empty string > add 10 points to the current user
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
                            // If more than 5 rounds, end the game and remove game data.
                            io.sockets.in(currentGame.roomId).emit('game-ended', { users: currentGame.users });
                            game.splice(getRoomInfo(socket, game), 1);
                        }
        
                        // To all users in the room > update the score board
                        io.sockets.in(currentGame.roomId).emit('userlist', { users: currentGame.users, questionPicker: currentGame.questionPicker, round: currentGame.round });  
                    }
                    else {
                        // If the message is not the correct answer, just send it.
                        io.sockets.in(currentGame.roomId).emit('chat-message', { userName: socket.userName, message: message });
                    }
                }
            }
            else {
                socket.emit('server-message', { type: "error", message: "⚠️ Something went wrong with sending your message. Try again or refresh the page." });
            }
        });
    
        // When question picker asks a question
        socket.on('question-asked', async (questionObj) => {
            const currentGame = game[getRoomInfo(socket, game)];

            // If question picker is not the only player
            if(currentGame && currentGame.users && currentGame.users.length > 1) {

                // Check if all required fields are filled
                if(questionObj.answer && questionObj.hint1 && questionObj.hint2) {
                    
                    // Set the answer to the game data and fetch images
                    currentGame.correctAnswer = questionObj.answer.toLowerCase();
                    const img1 = await getData(questionObj.hint1.toLowerCase());
                    const img2 = await getData(questionObj.hint2.toLowerCase());
        
                    // If there are image results > Start the round 
                    if(img1 && img2 && img1.results && img2.results && img1.results[0] && img2.results[0]) {
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
                // A minimum of 2 players in a room
                socket.emit('server-message', { type: "error", message: "⚠️ Wait for other players before starting a round. At least one other player is required." });
            }
        });
        
        // When a user is disconnecting from a room
        socket.on('disconnecting', () => {
            const existingGame = getRoomInfo(socket, game);
    
            // If game exists
            if(existingGame != -1) {
                const currentGame = game[existingGame];

                if(currentGame) {
                    const userIndex = getUserIndex(currentGame, socket);
                
                    // Leave current room
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
            }
        });
    });
}

// Export socket module
module.exports = useSockets;