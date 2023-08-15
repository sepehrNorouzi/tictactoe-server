const match_wait = [];
const { v4: uuidv4 } = require("uuid");

const status = { CONTINUE: 0, DRAW: 1, WIN: 2 };

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

const is_full = (board) => {
  return board.flat().every((value) => value !== 0);
};

const check_status = (board, turn) => {
  if (is_full(board)) {
    return status.DRAW;
  }
  const winningPatterns = [
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ], // Row 1
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ], // Row 2
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ], // Row 3
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ], // Column 1
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ], // Column 2
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ], // Column 3
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ], // Diagonal from top-left to bottom-right
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ], // Diagonal from top-right to bottom-left
  ];

  for (let i = 0; i < winningPatterns.length; i++) {
    const pattern = winningPatterns[i];
    const values = pattern.map(([row, col]) => board[row][col]);
    if (values.every((value) => value === turn)) {
      return status.WIN;
    }
  }

  return status.CONTINUE;
};

exports.match_make = (socket, io) => {
  if(match_wait.includes(socket)) {
    return;
  }
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
    p1.emit("match_made", {
      room: match_id,
      board: room.board,
      your_turn: p1.p_turn,
      board_turn: room.turn,
    });
    p2.emit("match_made", {
      room: match_id,
      board: room.board,
      your_turn: p2.p_turn,
      board_turn: room.turn,
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
    !get_room(io, data.room) ||
    !get_room(io, data.room).has(socket.id)
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

  else {
    return socket.emit("error", {message: "Invalid move."})
  }

  const state = check_status(board, socket.p_turn);

  if (state == status.DRAW) {
    return io.to(data.room).emit("end_game", { draw: 1, winner: null });
  } else if (state == status.WIN) {
    return io
      .to(data.room)
      .emit("end_game", { draw: 0, winner: socket.p_turn });
  }
  return io
    .to(data.room)
    .emit("move_made", { board: room.board, turn: room.turn });
};
