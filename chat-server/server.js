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

// const server = createServer(app);
// const socketio = new Server(server, {
//   path: '/socket.io',
// });
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

io.on('connection', client => {
  console.log('New client connected');

  const numberOfClients = io.engine.clientsCount;
  console.log(`Number of connected clients: ${numberOfClients}`);

  const broadcast = (event, data) => {
    client.emit(event, data);
    client.broadcast.emit(event, data);
  };

  client.on('message', message => {
    console.log(
      `Wiadomość ${message.userName} o treści ${message.messageUser}`
    );
    if (users[client.id] !== message.name) {
      users[client.id] = message.name;
      broadcast('user', users);
    }
    broadcast('message', message);
  });

  client.on('disconnect', () => {
    console.log('Client disconnected');

    delete users[client.id];
    client.broadcast.emit('user', users);

    const numberOfClients = io.engine.clientsCount;
    console.log(`Number of connected clients: ${numberOfClients}`);
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
