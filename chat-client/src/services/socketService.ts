import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;
// const socketLink = 'http://localhost:3001'
const socketLink = 'https://chat-app-vkdo.onrender.com'
const initializeSocket = ({
  userName,
  userId,
}: {
  userName: string | null;
  userId: number | null | undefined;
}) => {
  if (!socketInstance) {
    const socket = io(socketLink, {
      query: { userName, userId },
    });
    console.log('dolaczam do gry');
    socket.emit('join');
    socketInstance = socket;

    return socketInstance;
  }
};

const getSocket = () => {
  return socketInstance;
};

const resetSocket = () => {
  socketInstance = null;
};

export { initializeSocket, getSocket, resetSocket };
