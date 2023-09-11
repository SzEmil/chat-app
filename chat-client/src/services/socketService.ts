import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

const initializeSocket = ({
  userName,
  userId,
}: {
  userName: string | null;
  userId: number | null | undefined;
}) => {
  if (!socketInstance) {
    const socket = io('http://localhost:3001', {
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
