const { v4: uuidv4,  validate: uuidValidate } = require('uuid');

// Render the home page > generate a uuid
function index(req, res) {
    res.render("index", { rtw: false, roomNum: uuidv4() });
}

// Join the room page
function join(req, res) {
    
    // Check if room name was provided and if it's a valid uuid
    if(req.params.room && uuidValidate(req.params.room)) {
        res.render("join", { rtw: false, roomNum: req.params.room });
    }
    else {
        res.redirect("/");
    }
}

// On GET to play page > Redirect to join the room page
function play(req, res) {
    res.redirect(`/room/${req.params.room}`);
}

// 404 page
function error(req, res) {
    res.status(404).render("404",  { rtw: false });
}

// Export pages
module.exports = { index, join, play, error };