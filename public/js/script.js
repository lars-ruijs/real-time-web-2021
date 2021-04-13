const socket = io();
console.log("Client script");

const user = document.querySelector("span.username").textContent;
const room = location.pathname.split("/")[2];

const messageContainer = document.querySelector("section.messages");
const formContainer = document.querySelector("section.form");

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
  console.log("Question picker", data);

  if(guessingForm) {
    guessingForm.classList.add("hide");
  }

  makeQuestionForm();

});

socket.on('start-round', (data) => {

  const questionPickerForm = document.querySelector("form[name='question']");

  if(questionPickerForm){
    questionPickerForm.remove();
    guessingForm.classList.remove("hide");
  }

  addMessage("round", `${data.userName} has started the round. Start guessing now!`);

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("imagecontainer");

  data.images.forEach(image => {
    const img = document.createElement("img");
    img.src = image;
    imageContainer.appendChild(img);
  });

  messageContainer.appendChild(imageContainer);
});

socket.on('connected', (message) => {
  if(message.includes("disconnected")) {
    addMessage("disconnected", message);
  } else {
    addMessage("connected", message);
  }
}); 

socket.on('error', (message) => {
    addMessage("error", message);
}); 


socket.on('chat-message', (messageObj) => {
  addMessage("message", messageObj.message, messageObj.userName);
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

  const playerInfo = document.createElement("p");
  playerInfo.textContent = "You are the question picker! Think of a subject that the other players need to guess. Add two related keywords that determine which images are shown as hints. ";

  const subjectInput = createInput("text", "Subject to guess...", false, true);
  const imgSearch1 = createInput("text", "Related image subject", false, true);
  const imgSearch2 = createInput("text", "Related image subject", false, true);
  const submit = createInput("submit", false, "Start round", false);

  form.appendChild(playerInfo);
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