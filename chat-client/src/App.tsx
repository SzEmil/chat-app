import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { NotFound } from './pages/NotFound/NotFound';
import { RestrictedRoute } from './components/RestrictedRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

export let socket: any;
const App = () => {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [userName, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  useEffect(() => {
    if (isLoggedin) {
      socket = io('http://localhost:3001', { query: { userName, userId } });
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
    <>
      <Routes>
      <Route
            path="/"
            element={<RestrictedRoute component={HomePage} redirectTo="/chat" />}
          />

        <Route
          path="/chat"
          element={<ProtectedRoute component={ChatPage} redirectTo="/auth" />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
