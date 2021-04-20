const socket = io();
console.log("Client script");

const user = document.querySelector("span.username").textContent;
const room = location.pathname.split("/")[2];

const messageContainer = document.querySelector("section.messages");
const formContainer = document.querySelector("section.form");

const hintImg1 = document.querySelector("section.hints div.imagecontainer figure:first-of-type img");
const hintImg2 = document.querySelector("section.hints div.imagecontainer figure:nth-of-type(2) img");

const guessingForm = document.querySelector("form[name='guessing']");

socket.emit('new-user', { userName: user, roomId: room });

socket.on('userlist', (dataObj) => {
  const scoreboard = document.querySelector("ul.scoreboard");
  const round = document.querySelector("aside section p:first-of-type");

  if(scoreboard) {
    scoreboard.remove();
  }
  
  round.textContent = `Round ${dataObj.round}`;
  makeScoreBoard(dataObj);
}); 

socket.on('questionPicker', (data) => {

  if(guessingForm) {
    guessingForm.classList.add("hide");
  }

  makeQuestionForm();

});

socket.on('start-round', (data) => {

  const questionPickerForm = document.querySelector("form[name='question']");
  const questionPickerInfo = document.querySelector("section.messages div.pickerInfo");

  if(questionPickerForm && questionPickerInfo){
    questionPickerInfo.remove();
    questionPickerForm.remove();
    guessingForm.classList.remove("hide");
    addMessage("round", `🏁 🏁 You started the round. Others can start guessing now! 🏁 🏁`);
  }
  else {
    addMessage("round", `🏁 🏁 ${data.userName} has started the round. Start guessing now! 🏁 🏁`);
  }

  hintImg1.src = data.images[0];
  hintImg2.src = data.images[1];
});

socket.on('server-message', (messageObj) => {

  if(messageObj.type === "newPicker") {
    hintImg1.src = "/images/guessimage.png";
    hintImg2.src = "/images/questionmarks.png";
  }

  addMessage(messageObj.type, messageObj.message);
}); 

socket.on('error', (message) => {
    addMessage("error", message);
}); 

socket.on('chat-message', (messageObj) => {
  addMessage("message", messageObj.message, messageObj.userName);
});

socket.on('game-ended', (scores) => {

  scores.users.sort(function (a, b) {
    return b.points - a.points;
  });

  const scoreScreen = document.querySelector("section.end-scores");
  const winnerTitle = document.querySelector("section.end-scores h2:nth-of-type(2)");
  winnerTitle.textContent = `${scores.users[0].userName} won the game!`;

  const scoreList = document.querySelector("section.end-scores ol");
  scores.users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.userName} • ${user.points} points`;
    scoreList.appendChild(li);
  });

  scoreScreen.style.height = "100%";

  const myCanvas = document.createElement('canvas');
  scoreScreen.appendChild(myCanvas);

  const myConfetti = confetti.create(myCanvas, {
    useWorker: true,
    resize: true
  });

  const duration = 8 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    // launch a few confetti from the left edge
    myConfetti({
      particleCount: 7,
      angle: 60,
      spread: 75,
      origin: { x: 0 }
    });
    // and launch a few from the right edge
    myConfetti({
      particleCount: 7,
      angle: 120,
      spread: 75,
      origin: { x: 1 }
    });

    // keep going until we are out of time
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
});

guessingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector("form[name='guessing'] input");
  if(message.value) {
    socket.emit('message', message.value);
    message.value = '';
  }
});


function makeScoreBoard(dataObj) {
  const container = document.querySelector("aside section");

  const ul = document.createElement("ul");
  ul.classList.add("scoreboard");

  dataObj.users.forEach((user, index) => {
    console.log(index);
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

function addMessage(type, message, userName) {
  const div = document.createElement("div");
  div.classList.add(type);

  const p = document.createElement("p");

  if(userName) {
    p.innerHTML = `<span>${userName}:</span> ${message}`;
  } else {
    p.textContent = message;
  }

  div.appendChild(p);
  messageContainer.appendChild(div);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

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

function questionAsked(event) {
  event.preventDefault();
  const subjectToGuess = document.querySelector("form[name='question'] input:first-of-type");
  const imgKeyword1 = document.querySelector("form[name='question'] input:nth-of-type(2)");
  const imgKeyword2 = document.querySelector("form[name='question'] input:nth-of-type(3)");

  if(subjectToGuess.value && imgKeyword1.value && imgKeyword2.value) {    
    socket.emit('question-asked', { answer: subjectToGuess.value, hint1: imgKeyword1.value, hint2: imgKeyword2.value });
  }
  console.log(subjectToGuess, imgKeyword1, imgKeyword2);
}

// document.querySelector('form').addEventListener('submit', (event) => {
//     event.preventDefault();
//     if (input.value) {
//       socket.emit('message', input.value);
//       input.value = '';
//     }
// });