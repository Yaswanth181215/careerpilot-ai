import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { logger, AppEventBus } from '@careerpilot/shared';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
console.log("CWD =", process.cwd());
const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Mount Socket.io with CORS settings matching the frontend
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Event definitions for socket communication
io.on('connection', (socket) => {
  logger.info(`[Socket] New connection established: ${socket.id}`);

  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    logger.info(`[Socket] Socket ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('userJoined', { socketId: socket.id });
  });

  socket.on('sendMessage', (data: { roomId: string; senderName: string; text: string }) => {
    logger.info(`[Socket] Message in room ${data.roomId} from ${data.senderName}`);
    io.to(data.roomId).emit('messageReceived', {
      senderName: data.senderName,
      text: data.text,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket] Connection closed: ${socket.id}`);
  });
});

// Forward appEventBus events over Socket.io where relevant (e.g. notifications)
AppEventBus.on('EVENT_DLQ_ALERT', (dlqPayload) => {
  logger.error('[Server] DLQ alert trapped. Broadcasting system error to admin rooms.');
  io.to('admin-alerts-room').emit('systemAlert', dlqPayload);
});

// Start Database & Web server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`[Server] Core API service is listening on port ${PORT}`);
  });
};

// Handle process termination gracefully
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM received. Shutting down server safely.');
  server.close(() => {
    logger.info('[Server] Connections closed. Exiting process.');
    process.exit(0);
  });
});

startServer();
