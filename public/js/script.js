const socket = io();
console.log("Client script");

const user = document.querySelector("span.username").textContent;
const room = location.pathname.split("/")[2];

const messageContainer = document.querySelector("section.messages");
const formContainer = document.querySelector("section.form");

const questionPickerForm = document.querySelector("form[name='question']");

socket.emit('new-user', { userName: user, roomId: room });

socket.on('userlist', (dataObj) => {
  const scoreboard = document.querySelector("ul.scoreboard");

  if(scoreboard) {
    scoreboard.remove();
    makeScoreBoard(dataObj);
  }
  else {
    makeScoreBoard(dataObj);
  }
}); 

socket.on('questionPicker', (data) => {
  console.log("Question picker", data);

  const guessingForm = document.querySelector("form[name='guessing']");

  if(guessingForm) {
    guessingForm.classList.add("hide");
  }

  makeQuestionForm();

});

socket.on('connected', (message) => {
    if(message.includes("disconnected")) {
      addMessage("disconnected", message);
    } else {
      addMessage("connected", message);
    }
}); 


function makeScoreBoard(dataObj) {
  console.log(dataObj);
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
    } else{
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
  const imgSearch2 = createInput("text", "Related image subject", false);
  const submit = createInput("submit", false, "Start round", false);

  form.appendChild(playerInfo);
  form.appendChild(subjectInput);
  form.appendChild(imgSearch1);
  form.appendChild(imgSearch2);
  form.appendChild(submit);

  formContainer.appendChild(form);
  form.addEventListener("submit", questionAsked);
}

function addMessage(type, message) {
  const div = document.createElement("div");
  div.classList.add(type);

  const p = document.createElement("p");
  p.textContent = message;

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
  console.log("Hello");
}

// document.querySelector('form').addEventListener('submit', (event) => {
//     event.preventDefault();
//     if (input.value) {
//       socket.emit('message', input.value);
//       input.value = '';
//     }
// });