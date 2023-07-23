const match_wait = [];
const { v4: uuidv4 } = require("uuid");

const get_room = (io, match_id) => {
  return io.of("/").adapter.rooms.get(match_id);
};

const init_room = (io, match_id) => {
  const room = get_room(io, match_id);
  const BOARD_SIZE = 3;
  const board = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    board.push(Array.from({ length: BOARD_SIZE }, () => 0));
  }
  room["turn"] = 1;
  room["board"] = board;
};

const isInbound = (val) => {
  return val >= 0 && val < 3;
};

const isValidMove = (board, row, col) => {
  return isInbound(row) && isInbound(col) && board[row][col] === 0;
};

exports.match_make = (socket, io) => {
  match_wait.push(socket);

  if (match_wait.length >= 2) {
    const match_id = uuidv4();
    const p1 = match_wait.pop();
    p1.p_turn = 1;
    const p2 = match_wait.pop();
    p2.p_turn = 2;
    p1.join(match_id);
    p2.join(match_id);
    init_room(io, match_id);
    const room = get_room(io, match_id);
    io.to(match_id).emit("match_made", {
      room: match_id,
      board: room.board,
      turn: room.turn,
    });
  }
};

exports.make_move = (socket, io, data) => {
  if (
    !data ||
    !("room" in data) ||
    !("move" in data) ||
    !("row" in data.move) ||
    !("col" in data.move) ||
    !get_room(io, data.room)
  ) {
    return socket.emit("error", { message: "Impropper data." });
  }
  const room = get_room(io, data.room);
  if (room.turn !== socket.p_turn) {
    return socket.emit("error", { message: "Not your turn." });
  }

  const board = room.board;
  const { row, col } = data.move;

  if (isValidMove(board, row, col)) {
    board[row][col] = socket.p_turn;
    room.turn = (room.turn % 2) + 1;
  }
  return io.to(data.room).emit("move_made", { board: room.board, turn: room.turn });
};
