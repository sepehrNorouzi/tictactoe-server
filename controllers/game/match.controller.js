const match_wait = [];
const { v4: uuidv4 } = require('uuid');

const init_room = (io, match_id) => {
    const room = io.of('/').adapter.rooms.get(match_id);
    const BOARD_SIZE = 3;
    const board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push(Array.from({ length: BOARD_SIZE }, () => 0));
    }
    room['turn'] = 1;
    room['board'] = board;
}

exports.match_make = (socket, io) => {
  match_wait.push(socket);

  if (match_wait.length >= 2) {
    const match_id = uuidv4();
    const p1 = match_wait.pop();
    const p2 = match_wait.pop();
    p1.join(match_id);
    p2.join(match_id);
    init_room(io, match_id);
    const room =  io.of('/').adapter.rooms.get(match_id);
    io.to(match_id).emit("match_made", {room: match_id, board: room.board, turn: room.turn});
  }
  
};
