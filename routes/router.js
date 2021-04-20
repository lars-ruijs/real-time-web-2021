const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const { index, join, play, error } = require('./../renders/pages');
const { playPost, userNamePost } = require('./../renders/posts');

router
    .get("/", index)
    .get("/room/:room", join)
    .get("/room/:room/play", play)
    .get("*", error)
    .post("/room/:room/play", urlencodedParser, userNamePost)
    .post("/play", urlencodedParser, playPost);

// Export router module
module.exports = router;