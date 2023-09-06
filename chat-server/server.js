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

  const broadcast = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };

  console.log('New client connected');
  users[client.id] = { id: client.id, userName };
  updateOnlineUsers();

  console.log(`Number of connected clients: ${io.engine.clientsCount}`);
  broadcast('activeUsers', io.engine.clientsCount);

  client.on('createRoom', roomName => {
    rooms[roomName] = { clients: {} };
    client.join(roomName);
  });

  client.on('joinRoom', roomName => {
    client.join(roomName);
  });

  client.on('message', message => {
    broadcast('message', message);
  });

  // client.on('message', (message, roomName) => {
  //   io.to(roomName).emit('message', message);
  // });

  client.on('disconnect', () => {
    console.log('Client disconnected');
    delete users[client.id];
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
