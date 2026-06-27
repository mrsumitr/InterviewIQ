import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: ENV.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));

      const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('chat-message', ({ roomId, message, sender }) => {
      socket.to(roomId).emit('chat-message', {
        message,
        sender,
        senderId: socket.userId,
        sentAt: new Date().toISOString(),
      });
    });

    socket.on('code-change', ({ roomId, code }) => {
      socket.to(roomId).emit('code-change', { code });
    });
  });

  return io;
};
