import { io } from 'socket.io-client';
import { Chat } from './components/chat';
import { useEffect, useState } from 'react';

export let socket: any;
const App = () => {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [userName, setUsername] = useState('');
  useEffect(() => {
    if (isLoggedin) {
      socket = io('http://localhost:3001', { query: { userName } });
      socket.emit('join');

      if (socket !== undefined) setSocketReady(true);
    } 
    

    return () => {
      if (isLoggedin) {
        socket.emit('leave');
        socket.close();
      }
    };
  }, [isLoggedin]);

  return (
    <div>
      <input
        name="userName"
        type="text"
        placeholder="Enter your username"
        value={userName}
        onChange={e => setUsername(e.target.value)}
      />
      <button onClick={() => setIsLoggedIn(true)}>LOGIN</button>
      {isLoggedin && <p>Logged</p>}
      {!isLoggedin && <p>No loged</p>}
      {isLoggedin && socketReady && (
        <Chat socket={socket} userName={userName} isLoggedin={isLoggedin} />
      )}
    </div>
  );
};

export default App;
