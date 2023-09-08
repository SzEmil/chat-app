import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './api/api.js';
import path from 'node:path';
import database from './helpers/dbConnection.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import http from 'http'; // Dodajemy moduł http

const app = express();
import './config/config-passport.js';

const httpServer = http.createServer(app); // Tworzymy serwer HTTP

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Adres aplikacji klienckiej
    methods: ['GET', 'POST'],
  },
});

dotenv.config();
const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(express.json());

app.use(cors());

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api', router);

const users = {};
const rooms = {};

function updateOnlineUsers() {
  const onlineUsers = Object.values(users);
  io.emit('onlineUsers', onlineUsers);
}

io.on('connection', client => {
  const userName = client.handshake.query.userName;
  const userId = client.handshake.query.userId;

  const broadcast = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };

  io.sockets.sockets[userId] = client;
  console.log('New client connected');
  users[userId] = { id: userId, userName };
  updateOnlineUsers();

  client.on('userRooms', userId => {
    const userRooms = Object.values(rooms).filter(room =>
      room.clients.some(client => client.id == userId)
    );
    client.emit('userRooms', userRooms);
  });

  console.log(`Number of connected clients: ${io.engine.clientsCount}`);
  broadcast('activeUsers', io.engine.clientsCount);

  client.on('createChat', ({ userId, roomName, chatUsers }) => {
    //tu trzeba w bazie danych tworzyć czat łączyc go z userem i dosyłać obiekt czatu
    const existingRoom = Object.values(rooms).find(room => {
      const existingChatUsers = room.clients || [];
      if (
        existingChatUsers.length === chatUsers.length &&
        existingChatUsers.every(user =>
          chatUsers.some(chatUser => chatUser.id == user.id)
        )
      ) {
        return true;
      }
      return false;
    });

    if (existingRoom) {
      const userSocket = io.sockets.sockets[userId];
      if (userSocket) {
        const error = {
          message: `Chat with these ${chatUsers.map(
            user => user.userName
          )} already exists.`,
          data: chatUsers,
          type: 'chat already exists',
        };
        userSocket.emit('chatError', error);
      }
    } else {
      rooms[roomName] = { id: roomName, owner: userId, clients: chatUsers };
      chatUsers.forEach(user => {
        const userSocket = io.sockets.sockets[user.id];
        if (userSocket) {
          userSocket.join(roomName);
        }
      });
      io.in(roomName).emit('createChat', { roomName, chatUsers, userId });
    }
  });

  client.on('openChat', ({ userId, roomName, chatUsers }) => {
    const conectionReady = false;
    const existingRoom = Object.values(rooms).find(room => {
      const existingChatUsers = room.clients || [];
      if (
        existingChatUsers.length === chatUsers.length &&
        existingChatUsers.every(user =>
          chatUsers.some(chatUser => chatUser.id == user.id)
        )
      ) {
        return true;
      }
      return false;
    });

    if (existingRoom) {
      const userSocket = io.sockets.sockets[userId];
      if (userSocket) {
        return;
      }
    } else {
      rooms[roomName] = { clients: chatUsers };
      chatUsers.forEach(user => {
        const userSocket = io.sockets.sockets[user.id];
        if (userSocket) {
          userSocket.join(roomName);
        }
      });
      conectionReady = true;
      io.in(roomName).emit('openChat', { roomName });
    }
  });

  client.on('message', (message, roomName) => {
    io.to(roomName).emit('message', message);
  });

  client.on('endChat', roomName => {
    const room = rooms[roomName];
    const chatUsers = room.clients;

    chatUsers.forEach(user => {
      const userSocket = io.sockets.sockets[user.id];

      if (userSocket) {
        userSocket.emit('endChat', { roomName });
        userSocket.leave(roomName);
      }
    });

    delete rooms[roomName];
  });

  client.on('leaveServer', () => {
    console.log('Client disconnected');
    delete users[userId];
    delete io.sockets.sockets[userId];
    updateOnlineUsers();

    const numberOfClients = io.engine.clientsCount;
    console.log(`Number of connected clients: ${numberOfClients}`);
    broadcast('activeUsers', io.engine.clientsCount);
  });

  client.on('disconnect', () => {
    console.log('Client disconnected');
    delete users[userId];
    delete io.sockets.sockets[userId];
    updateOnlineUsers();

    const numberOfClients = io.engine.clientsCount;
    console.log(`Number of connected clients: ${numberOfClients}`);
    broadcast('activeUsers', io.engine.clientsCount);
  });
});

app.use((err, _, res, __) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: err,
    data: 'Not found',
  });
});

app.use((err, _, res, __) => {
  console.log(err.stack);
  res.status(500).json({
    status: 'fail',
    code: 500,
    message: err.message,
    data: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3001;

database.connect(error => {
  if (error) {
    console.error('Error during connection to database: ' + error);
  } else {
    console.log('Database connected');
    httpServer.listen(PORT, () => {
      console.log(`Serwer uruchomiony na porcie ${PORT}`);
    });
  }
});
