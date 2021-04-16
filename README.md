# 🖼 ImgGeek
I am planning to make a multi player game where the players take turns thinking of a topic that the other players have to guess. The player who comes up with the topic adds general pictures describing the subject. For example, when you come up with the topic of fishing, you could show pictures of water, a boat, and an aquarium. 

**About this project**

This project is part of the Real-Time Applications course at CMD, part of the Amsterdam University of Applied Sciences. In this course we will learn how to build a real-time application, with open connections between the client and the server.

<br>

## ✨ View it live
View a live preview [here](https://imggeek.herokuapp.com/).

<br>

## ✏️ Concept sketches
I came up with several variations on my concept before making a final choice. 

### Drawing game
Below is an outline of an idea where players have to take turns redrawing an image that comes from an API. The other players must then guess what the subject of the sketch is. 

![IMG_3433](https://user-images.githubusercontent.com/60745347/114394022-03262600-9b9b-11eb-8268-9f2ab1831d53.JPG)

### Image hints
In this concept, players take turns thinking of a topic that the other players have to guess. The player who comes up with the topic adds general pictures describing the subject. Each player who successfully guesses the topic earns points. 

![IMG_3432](https://user-images.githubusercontent.com/60745347/114394030-06b9ad00-9b9b-11eb-857c-2a4a16f5b407.JPG)

### Computer player
In this concept, players play against a computer. Each round, the computer searches for an image and displays possible topics for that image below it. The player who guesses the correct topic the fastest wins the round. 

![IMG_3431](https://user-images.githubusercontent.com/60745347/114394034-08837080-9b9b-11eb-9bc6-69db62e7e96b.JPG)

### Chosen concept
I chose the second concept (image hints) because I think it would be an interesting project to work on. Because users are allowed to take turns in coming up with a question, the game remains exciting. In addition, the person asking the question does not know in advance which image will be selected as a hint, so he has to think carefully about which keywords to use. 


## Data lifecycle Diagram
![image](https://user-images.githubusercontent.com/60745347/114989543-d1150c80-9e97-11eb-968b-b49cfa7563fb.png)

<br>

## ⬇️ How to install

### Clone the repository
```
git clone https://github.com/lars-ruijs/real-time-web-2021.git
```

### Navigate to the repository and install the packages
```
npm install
```

### Start local development environment
```
npm run dev
```

<br>

## 📚 Sources
So far, I have used the following sources while working on this project:

- **Socket.io cheatsheet** [link](https://socket.io/docs/v3/emit-cheatsheet/index.html)
- **Socket.io rooms** [link](https://socket.io/docs/v4/rooms/)
- **Difference between io.sockets.in emit and sockets.broadcast.emit** [link](https://stackoverflow.com/questions/10342681/whats-the-difference-between-io-sockets-emit-and-broadcast) 
 
<br>

## 🔗 License
This repository is licensed as MIT • ©️ 2021 Lars Ruijs



<!-- Here are some hints for your project! -->

<!-- Start out with a title and a description -->

<!-- Add a link to your live demo in Github Pages 🌐-->

<!-- ☝️ replace this description with a description of your own work -->

<!-- replace the code in the /docs folder with your own, so you can showcase your work with GitHub Pages 🌍 -->

<!-- Add a nice image here at the end of the week, showing off your shiny frontend 📸 -->

<!-- Maybe a table of contents here? 📚 -->

<!-- How about a section that describes how to install this project? 🤓 -->

<!-- ...but how does one use this project? What are its features 🤔 -->

<!-- What external data source is featured in your project and what are its properties 🌠 -->

<!-- This would be a good place for your data life cycle ♻️-->

<!-- Maybe a checklist of done stuff and stuff still on your wishlist? ✅ -->

<!-- How about a license here? 📜  -->
