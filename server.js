require('dotenv').config();
const express = require('express');
const router = require('./routes/router');

// Create a express app
const app = express();
const port = process.env.PORT || 3000;
const useSockets = require('./modules/socket');
const server = require('http').createServer(app);

// Set static file directory. Source: https://expressjs.com/en/starter/static-files.html
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
    .use(router);

// Use sockets connection
useSockets(server);

server.listen(port);
