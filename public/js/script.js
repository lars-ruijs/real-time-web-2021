const socket = io();
console.log("Client script");

const user = document.querySelector("span.username").textContent;
const room = location.pathname.split("/")[2];

socket.emit('new-user', { userName: user, roomId: room });

socket.on('userlist', (users) => {
  const scoreboard = document.querySelector("ul.scoreboard");

  if(scoreboard) {
    scoreboard.remove();
    makeScoreBoard(users);
  }
  else {
    makeScoreBoard(users);
  }
}); 

socket.on('connected', (message) => {
    console.log(message);
}); 


function makeScoreBoard(users) {
  const container = document.querySelector("section:first-of-type");
  const ul = document.createElement("ul");
  ul.classList.add("scoreboard");
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user.userName;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

// document.querySelector('form').addEventListener('submit', (event) => {
//     event.preventDefault();
//     if (input.value) {
//       socket.emit('message', input.value);
//       input.value = '';
//     }
// });