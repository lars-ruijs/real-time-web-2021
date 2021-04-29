# 🖼 ImgGeek
I made a multi player game where the players take turns thinking of a topic that the other players have to guess. The player who comes up with the topic adds general pictures describing the subject. For example, when you come up with the topic of fishing, you could show pictures of water, a boat, and an aquarium. 

**About this project**

This project is part of the Real-Time Applications course at CMD, part of the Amsterdam University of Applied Sciences. In this course we will learn how to build a real-time application, with open connections between the client and the server.

<br>

## ✨ View it live
![imggeek-mockup](https://user-images.githubusercontent.com/60745347/116573331-fe889e00-a90c-11eb-830c-1afc73966f5c.jpg)

View a live preview [here](https://imggeek.herokuapp.com/).

<br>

## ✏️ Concept sketches
I came up with several variations on my concept before making a final choice. 

<details>
  <summary>Drawing game</summary>
  
  <br>
  
  Below is an outline of an idea where players have to take turns redrawing an image that comes from an API. The other players must then guess what the subject of the sketch is. 

![IMG_3433](https://user-images.githubusercontent.com/60745347/114394022-03262600-9b9b-11eb-8268-9f2ab1831d53.JPG)

</details>

<details>
  <summary>Image hints</summary>
  
  <br>
  
  In this concept, players take turns thinking of a topic that the other players have to guess. The player who comes up with the topic adds general pictures describing the subject. Each player who successfully guesses the topic earns points. 

![IMG_3432](https://user-images.githubusercontent.com/60745347/114394030-06b9ad00-9b9b-11eb-857c-2a4a16f5b407.JPG)

</details>

<details>
  <summary>Computer player</summary>
  
  <br>
  
 In this concept, players play against a computer. Each round, the computer searches for an image and displays possible topics for that image below it. The player who guesses the correct topic the fastest wins the round. 

![IMG_3431](https://user-images.githubusercontent.com/60745347/114394034-08837080-9b9b-11eb-9bc6-69db62e7e96b.JPG)

</details>


### Chosen concept
I chose the second concept (image hints) because I think it would be an interesting project to work on. Users are allowed to take turns in coming up with a question. This ensures that the game remains exciting. In addition, the person asking the question does not know in advance which image will be selected as a hint, so he has to think carefully about which keywords to use. 

<br>

## 🧞 Wishlist 
Below is a list of features I would like to add to my project, formatted using the MoSCoW method.

### Must have
- [X] Chat function with usernames
- [X] Set user roles (question picker or player)
- [X] Connect with Unsplash API
- [X] Question picker can ask a question
- [X] Players can answer that question
- [X] Points system

### Should have
- [X] Different rounds, with a different question picker
- [X] Multiple rooms support
- [X] Scoreboard
- [X] Join a room via the homepage
- [X] Add nice styling
- [ ] Add user onboarding information 

### Could have
- [ ] Connect to a database to store data
- [ ] Let users buy hints
- [ ] Let users skip rounds (when 1v1)

### Would have
- [ ] Create time-based rounds
- [ ] The faster someone answers, the more points that person gets
- [ ] Create public and private rooms
- [ ] Join a public room with random users
- [ ] Upload your own images as hints
- [ ] Add video's as hints


<br>

## 🚴‍♂️ Data lifecycle Diagram
![image](https://user-images.githubusercontent.com/60745347/114989543-d1150c80-9e97-11eb-968b-b49cfa7563fb.png)

<br>

## 🐒 API
For this project, I am using the **Unsplash API** to find photos for specified keywords. The Unsplash API is free. In development mode you are limited to making 50 requests per hour. Perfect for testing! When your application is finished, you can send a request to the team at Unsplash to increase the limit to production level. This allows you to make 5000 requests per hour. When you send the request, fill in all the necessary details so that the Unsplash team can check whether your app follows all the API rules. Approval of a request can take up to 10 business days. 

### Get started
**First,** request an API key from Unsplash. Copy the link below and click on the button "Register as a Developer"

```
https://unsplash.com/developers
```

**Next,** click on "New Application" to register your app (or use the link below). Accept the terms and conditions. 

```
https://unsplash.com/oauth/applications/new
```

**Finally,** you will now receive an Access Key and a Secret Key. In my app, I use the Access Key when sending requests to the API. For example, to search photos to go with a particular keyword, use the link below: 

```
https://api.unsplash.com/search/photos/?client_id=${API_KEY_HERE}&query=${SEARCH_KEYWORD_HERE}&order_by=popular
```

<br>

### API Data model
```
API RESPONSE
+-----------------------+
| total: Integer        |      RESULTS
| total_pages: Integer  |     +---------------------------------+
| results: Array        +-----+ id: String                      |
+-----------------------+     | created_at: String              |               URLS
                              | updated_at: String              |              +-----------------+
                              | promoted_at: String             |     +------->+ raw: String     |
                              | width: Integer                  |     |        | full: String    |
                              | height: Integer                 |     |        | regular: String |
                              | color: String                   |     |        | small: String   |
                              | blur_hash: String               |     |        | thumb: String   |
                              | description: String             |     |        +-----------------+
                              | alt_description: String         |     |
                              | urls: Object                    +-----+         LINKS
                              | links: Object                   +--------------+---------------------------+
                              | likes: Integer                  |              | self: String              |
                              | liked_by_user: Boolean          |              | html: String              |
                              | current_user_collections: Array |              | download: String          |
                              | sponsorship: Boolean            |              | download_location: String |
                              | user: Object                    +-----+        | categories: Array         |
                              | tags: Array                     |     |        +---------------------------+
                              +---------------------------------+     |
                                                                      |         USER
                                                                      +------->+----------------------------+
                                                                               | id: String                 |
                                                                               | updated_at: String         |
                                                                               | username: String           |
                                                                               | name: String               |
                                                                               | first_name: String         |                LINKS
                                                                               | last_name: String          |               +-------------------+
                                                                               | twitter_username: String   |         +---->+ self: String      |
                                                                               | portfolio_url: String      |         |     | html: String      |
                                                                               | bio: String                |         |     | photos: String    |
                                                                               | location: String           |         |     | likes: String     |
                                                                               | links: Object              +---------+     | portfolio: String |
                                                                               | profile_image: Object      +---------+     | following: String |
                                                                               | instagram_username: String |         |     | followers: String |
                                                                               | total_collections: Integer |         |     +-------------------+
                                                                               | total_likes: Integer       |         |
                                                                               | total_photos: Integer      |         |      PROFILE_IMAGE
                                                                               | accepted_tos: Boolean      |         |     +-------------------+
                                                                               | for_hire: Boolean          |         +---->+ small: String     |
                                                                               +----------------------------+               | medium: String    |
                                                                                                                            | large: String     |
                                                                                                                            +-------------------+

```

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

### Navigate to localhost
```
http://localhost:3000/
```

<br>

## 📚 Sources
I have used the following sources while working on this project:

- **Unsplash API** documentation used for getting image results for a given keyword. Read the documentation [here](https://unsplash.com/documentation#search-photos);
- **Socket.io cheatsheet** with information about how events work between server and client. Read more [here](https://socket.io/docs/v3/emit-cheatsheet/index.html);
- **Socket.io rooms** information about applying room functionality within socket.io. Code examples used from [the docs](https://socket.io/docs/v4/rooms/);
- **Difference between io.sockets.in emit and sockets.broadcast.emit** when emitting events in a room with users. Answered by StackOverflow user Jayantha Lal Sirisena. Read the answer [here](https://stackoverflow.com/questions/10342681/whats-the-difference-between-io-sockets-emit-and-broadcast);
- **How to emit an event to a specific socket** code example used from an answer on Edureka by user Niroj. View it [here](https://www.edureka.co/community/67618/how-can-i-send-a-message-to-a-particular-client-with-socket-io);
- **Check if username doesn't contain special characters** a RegEx code example used from an answer by user Kooilnc on [StackOverflow](https://stackoverflow.com/questions/11896599/javascript-code-to-check-special-characters/11896930).
- **Implement DOTENV** for storing server side secrets. Documentation used from [NPM](https://www.npmjs.com/package/dotenv);
- **Force HTTPS connection** article on how to implement HTTPS redirect with ExpressJS from [Divio](https://docs.divio.com/en/latest/how-to/node-express-force-https/);
- **Sort numbers from highest to lowest** to display user scores in the right order using sort(). Code example used from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort);
- **Canvas-confetti** external package for displaying confetti. Code example used from the [NPM](https://www.npmjs.com/package/canvas-confetti#examples) documentation;
- **Generate UUID** using an external NPM package. Code examples used from the [documentation](https://www.npmjs.com/package/uuid) (including code examples about UUID validation);
- **MacBook Pro on wooden Desk** mockup via [MockupWorld](https://www.mockupworld.co/free/macbook-pro-on-wooden-desk-mockup/).

 
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
