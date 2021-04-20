// Connect to socket.io library
const socket = io();

// Get username and roomId
const user = document.querySelector("span.username").textContent;
const room = location.pathname.split("/")[2];

// Containers for messages and the form
const messageContainer = document.querySelector("section.messages");
const formContainer = document.querySelector("section.form");

// Images inside the hint container
const hintImg1 = document.querySelector("section.hints div.imagecontainer figure:first-of-type img");
const hintImg2 = document.querySelector("section.hints div.imagecontainer figure:nth-of-type(2) img");

// Message form
const guessingForm = document.querySelector("form[name='guessing']");

// Emit new-user event (when script is loaded) with the userName and roomId
socket.emit('new-user', { userName: user, roomId: room });

// On userlist event > update round, usernames and points inside scoreboard
socket.on('userlist', (dataObj) => {
  const scoreboard = document.querySelector("ul.scoreboard");
  const round = document.querySelector("aside section p:first-of-type");

  // Remove old scoreboard (if present)
  if(scoreboard) {
    scoreboard.remove();
  }
  
  round.textContent = `Round ${dataObj.round}`;
  makeScoreBoard(dataObj);
}); 

// When a (new) question picker is set
socket.on('questionPicker', () => {

  // Hide normal messages form > Make question picker form
  guessingForm.classList.add("hide");
  makeQuestionForm();

});

// When a round is started by the question picker
socket.on('start-round', (data) => {
  const questionPickerForm = document.querySelector("form[name='question']");
  const questionPickerInfo = document.querySelector("section.messages div.pickerInfo");

  // Remove the question picker form and game information > Show the normal messages form > Add message
  if(questionPickerForm && questionPickerInfo){
    questionPickerInfo.remove();
    questionPickerForm.remove();
    guessingForm.classList.remove("hide");
    addMessage("round", `🏁 🏁 You started the round. Others can start guessing now! 🏁 🏁`);
  }
  else {
    addMessage("round", `🏁 🏁 ${data.userName} has started the round. Start guessing now! 🏁 🏁`);
  }

  // Set the hint images sources
  hintImg1.src = data.images[0];
  hintImg2.src = data.images[1];
});

// When the server sends a message
socket.on('server-message', (messageObj) => {

  // If it's a new question picker message (round-ended) > replace the hint images for the defaults
  if(messageObj.type === "newPicker") {
    hintImg1.src = "/images/guessimage.png";
    hintImg2.src = "/images/questionmarks.png";
  }

  // Add message
  addMessage(messageObj.type, messageObj.message);
}); 

// When a chat message was send
socket.on('chat-message', (messageObj) => {
  addMessage("message", messageObj.message, messageObj.userName);
});

// When the game ends
socket.on('game-ended', (scores) => {

  // Sort the scores from highest to lowest
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  scores.users.sort(function (a, b) {
    return b.points - a.points;
  });

  // Title with the username of the player who won
  const winnerTitle = document.querySelector("section.end-scores h2:nth-of-type(2)");
  winnerTitle.textContent = `${scores.users[0].userName} won the game!`;

  // Add a final scorelist
  const scoreList = document.querySelector("section.end-scores ol");
  scores.users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.userName} • ${user.points} points`;
    scoreList.appendChild(li);
  });

  // Show the scorescreen overlay by setting the height to 100%
  const scoreScreen = document.querySelector("section.end-scores");
  scoreScreen.style.height = "100%";

  // Add confetti to the screen, using 'canvas-confetti'
  // Source: https://www.npmjs.com/package/canvas-confetti#examples
  const myCanvas = document.createElement('canvas');
  scoreScreen.appendChild(myCanvas);

  const myConfetti = confetti.create(myCanvas, {
    useWorker: true,
    resize: true
  });

  const duration = 8 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    // Launch confetti from the left edge
    myConfetti({
      particleCount: 7,
      angle: 60,
      spread: 75,
      origin: { x: 0 }
    });
    // Launch from the right edge
    myConfetti({
      particleCount: 7,
      angle: 120,
      spread: 75,
      origin: { x: 1 }
    });

    // Keep going until time ends
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
});

// When a message gets send
guessingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector("form[name='guessing'] input");
  if(message.value) {
    socket.emit('message', message.value);
    message.value = '';
  }
});


// Make the scoreboard with usernames and scored points
function makeScoreBoard(dataObj) {
  const container = document.querySelector("aside section");

  const ul = document.createElement("ul");
  ul.classList.add("scoreboard");

  dataObj.users.forEach((user, index) => {
    const li = document.createElement("li");
    const div = document.createElement("div");
    
    const userName = document.createElement("p");
    
    // If user is question picker
    if(index === dataObj.questionPicker) {
        userName.textContent = `👑 ${user.userName}`;
    } else {
        userName.textContent = user.userName;
    }    
    div.appendChild(userName);

    const points = document.createElement("p");
    points.textContent = `${user.points} points`;
    div.appendChild(points);

    li.appendChild(div);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// Make the question picker form
function makeQuestionForm() {
  const form = document.createElement("form");
  form.setAttribute("name", "question");

  const subjectInput = createInput("text", "Topic to guess...", false, true);
  const imgSearch1 = createInput("text", "📸 Image keyword", false, true);
  const imgSearch2 = createInput("text", "📸 Image keyword", false, true);
  const submit = createInput("submit", false, "Start round", false);

  form.appendChild(subjectInput);
  form.appendChild(imgSearch1);
  form.appendChild(imgSearch2);
  form.appendChild(submit);

  formContainer.appendChild(form);
  form.addEventListener("submit", questionAsked);
}

// Add messages to the messages container
function addMessage(type, message, userName) {
  const div = document.createElement("div");
  div.classList.add(type);

  const p = document.createElement("p");

  // If username is provided
  if(userName) {
    p.innerHTML = `<span>${userName}:</span> ${message}`;
  } else {
    p.textContent = message;
  }

  div.appendChild(p);
  messageContainer.appendChild(div);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Create a form input
function createInput(type, placeholder, value, required) {
  const input = document.createElement("input");
  input.setAttribute("type", type);
  
  if(placeholder) {
    input.setAttribute("placeholder", placeholder);
  }

  if(value) {
    input.setAttribute("value", value);
  }

  if(required) {
    input.setAttribute("required", "");
  }

  return input;
}

// When the question picker starts a round > get input values > emit event to server
function questionAsked(event) {
  event.preventDefault();
  const subjectToGuess = document.querySelector("form[name='question'] input:first-of-type");
  const imgKeyword1 = document.querySelector("form[name='question'] input:nth-of-type(2)");
  const imgKeyword2 = document.querySelector("form[name='question'] input:nth-of-type(3)");

  if(subjectToGuess.value && imgKeyword1.value && imgKeyword2.value) {    
    socket.emit('question-asked', { answer: subjectToGuess.value, hint1: imgKeyword1.value, hint2: imgKeyword2.value });
  }
}