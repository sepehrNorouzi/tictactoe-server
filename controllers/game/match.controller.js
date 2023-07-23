const match_wait = [];
const { v4: uuidv4 } = require('uuid');
exports.match_make = (socket, io) => {
  match_wait.push(socket);

  if (match_wait.length >= 2) {
    const match_id = uuidv4();
    const p1 = match_wait.pop();
    const p2 = match_wait.pop();
    p1.join(match_id);
    p2.join(match_id);
    io.to(match_id).emit("match_made", {room: match_id})
  }
  
};
