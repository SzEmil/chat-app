import { io } from 'socket.io-client';
import { Chat } from './components/chat';
import { useEffect } from 'react';

export const socket = io('http://localhost:3001');
const App = () => {
  useEffect(() => {
    window.addEventListener('beforeunload', handleWindowClose);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
    };
  }, []);

  const handleWindowClose = () => {
    socket.close();
  };
  return (
    <div>
      <Chat />
    </div>
  );
};

export default App;
