const { Server } = require('socket.io')
const stream  = require('./ws/stream')

exports.init = (server) => {
    const io = new Server(server, { 
        allowEIO3: true,
        cors: {
            origin: ["*", ],
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    io.on('connection', socket => {
        stream(socket, io);
    })
}


