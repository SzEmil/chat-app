import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './api/api.js';
import path from 'node:path';
import database from './helpers/dbConnection.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import http from 'http';
import serviceChats from './service/serviceChats.js';
serviceUser;

const app = express();
import './config/config-passport.js';
import serviceUser from './service/serviceUser.js';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
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

async function updateOnlineUsers() {
  const onlineUsers = Object.values(users);
  io.emit('onlineUsers', { onlineUsers });
}
async function updateAllUsers() {
  const allUsers = await serviceUser.getUsersData();
  io.emit('getAllUsers', { allUsers });
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
  updateAllUsers();
  client.on('getLoggedUsers', updateOnlineUsers);
  client.on('getAllUsers', updateAllUsers);

  client.on('userRooms', async userId => {
    const existingChats = await serviceChats.getUserChats(userId);
    client.emit('userRooms', existingChats);
  });

  console.log(`Number of connected clients: ${io.engine.clientsCount}`);
  broadcast('activeUsers', io.engine.clientsCount);

  client.on('newMessageChecked', async (chatId, userId) => {
    const isNewMessageArrived = await serviceChats.newMessageChecked(
      chatId,
      userId
    );

    client.emit('newMessageChecked', { isNewMessageArrived, chatId });
  });

  client.on('createChat', async ({ userId, roomName, chatUsers, chatName }) => {
    const existingChats = await serviceChats.getUserChats(userId);
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

    const existingChat = existingChats.find(room => {
      const existingChatUsers = JSON.parse(room.clients) || [];
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

    if (existingRoom || existingChat) {
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
      try {
        const newChat = await serviceChats.createNewChat(
          chatName,
          chatUsers,
          userId
        );

        JSON.parse(newChat.clients).forEach(client => {
          const userSocket = io.sockets.sockets[client.id];
          if (userSocket) {
            userSocket.emit('createChat', {
              roomName: newChat.id,
              chatUsers: JSON.parse(newChat.clients),
              userId: newChat.owner,
              chatName: newChat.chatname,
              lastMessage: '',
            });
          }
        });
      } catch (e) {
        throw e.message;
      }
    }
  });

  client.on('openChat', ({ userId, roomName, chatUsers }) => {
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
        userSocket.join(roomName);
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

      io.in(roomName).emit('openChat', { roomName });
    }
  });

  client.on('getChatMessages', async chatId => {
    const chatMessages = await serviceChats.getChatMessages(chatId);

    client.emit('getChatMessages', chatMessages);
  });

  client.on('message', async (message, roomName, chatMembers) => {
    const newMessage = await serviceChats.createMessage(
      message.chatId,
      message.owner,
      message.messageUser,
      message.userName
    );

    const chatId = message.chatId;
    const messageData = {
      newMessage: message.messageUser,
      user: message.userName,
    };
    for (const chatMember of chatMembers) {
      const ownerSocket = io.sockets.sockets[chatMember.id];
      if (ownerSocket)
        ownerSocket.emit('newMessageDataArrived', { messageData, chatId });
      if (chatMember.id != message.owner) {
        const isNewMessageArrived = await serviceChats.newMessageArrived(
          message.chatId,
          chatMember.id
        );
        const userSocket = io.sockets.sockets[chatMember.id];

        if (userSocket) {
          userSocket.emit('newMessageArrived', { isNewMessageArrived, chatId });
        }
      }
    }

    io.to(roomName).emit('message', newMessage);
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
    if (io.sockets.sockets[userId]) {
      io.sockets.sockets[userId].disconnect(true);
    }
    delete io.sockets.sockets[userId];
    updateOnlineUsers();

    const numberOfClients = io.engine.clientsCount;
    console.log(`Number of connected clients: ${numberOfClients}`);
    broadcast('activeUsers', io.engine.clientsCount);
  });

  client.on('disconnect', () => {
    console.log('Client disconnected');
    delete users[userId];
    if (io.sockets.sockets[userId]) {
      io.sockets.sockets[userId].disconnect(true);
    }
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
