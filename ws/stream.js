const { match_make } = require('../controllers/game/match.controller')
const stream = (socket, io) => {
    socket.on("match_make", () => {
        match_make(socket, io);
    });

}

module.exports = stream;