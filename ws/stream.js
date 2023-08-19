const {
	match_make,
	make_move,
	match_make_cancel,
} = require("../controllers/game/match.controller");
const stream = (socket, io) => {
	socket.on("match_make", () => {
		match_make(socket, io);
	});

	socket.on("make_move", (data) => {
		make_move(socket, io, data);
	});

	socket.on("match_make_cancel", (data) => {
		match_make_cancel(socket, io, data);
	});
};

module.exports = stream;
