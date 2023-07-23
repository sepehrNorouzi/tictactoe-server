const { Server } = require('socket.io')


exports.init = (server) => {
    const io = new Server(server, { 
        allowEIO3: true,
        cors: {
            origin: ["*", ],
            methods: ["GET", "POST"],
            credentials: true,
        }
    });
    
    io.on('connection', () => {
        console.log('connection established');
    })
}


