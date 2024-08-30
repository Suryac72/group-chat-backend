import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('New WebSocket connection:', socket.id);

    socket.on('joinGroup', ({ groupId }) => {
      socket.join(groupId);
      console.log(`User joined group: ${groupId}`);
    });

    socket.on('sendMessage', ({ groupId, message }) => {
      io.to(groupId).emit('newMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected:', socket.id);
    });
  });
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
