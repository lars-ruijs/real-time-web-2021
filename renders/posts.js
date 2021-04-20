const { isValid } = require('./../modules/helpers');

// When posting a room code > Redirect to the rooms join page
function playPost(req, res) {
    res.redirect(`/room/${req.body.gamecode}`);
}

// When a user posts a username
function userNamePost(req, res) {
    const user = req.body.username;

        // If a username was received & does not contain harmfull characters > render the game
        if(user && isValid(user)) {
            res.render("play", { rtw: true, userName: user });
        }
        else {
            res.redirect(`/room/${req.params.room}`);
        }        
}

// Export posts
module.exports = { playPost, userNamePost };