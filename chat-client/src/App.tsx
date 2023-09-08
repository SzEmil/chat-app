import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { NotFound } from './pages/NotFound/NotFound';
import { RestrictedRoute } from './components/RestrictedRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useSelector } from 'react-redux';
import { selectAuthUserIsLoggedIn } from './redux/user/userSelectors';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './redux/store';
import { setSocket } from './redux/globals/globalsSlice';
import { selectAuthUserId } from './redux/user/userSelectors';
import { setSocketReady } from './redux/globals/globalsSlice';
import { selectAuthUserUsername } from './redux/user/userSelectors';
import { initializeSocket, getSocket } from './services/socketService';
import { refreshUser } from './redux/user/userOperations';
import { selectSocketReady } from './redux/globals/globalsSelectors';
import { useNavigate } from 'react-router-dom';

export let socket: any;
const App = () => {
  const dispatch: AppDispatch = useDispatch();
  const socketReady = useSelector(selectSocketReady);
  const isLoggedin = useSelector(selectAuthUserIsLoggedIn);
  const userId = useSelector(selectAuthUserId);
  const userName = useSelector(selectAuthUserUsername);

  useEffect(() => {
    const refreshUserData = async () => {
      await dispatch(refreshUser());
    };

    refreshUserData();
  }, []);

  // useEffect(() => {
  //   const initializeSocketAndRedux = async () => {
  //     if (isLoggedin) {
  //       const socket = initializeSocket({ userName, userId });
  //       await new Promise<void>(resolve => {
  //         socket.on('connect', () => {
  //           resolve();
  //         });
  //       });

  //       if (socket !== undefined) {
  //         // dispatch(setSocket(socket));
  //         dispatch(setSocketReady(true));
  //       }
  //     }
  //   };

  //   initializeSocketAndRedux();
  //   // if (socketReady) navigate('/chat');
  // }, [isLoggedin, socket]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<RestrictedRoute component={HomePage} redirectTo="/chat" />}
        />

        <Route
          path="/chat"
          element={<ProtectedRoute component={ChatPage} redirectTo="/" />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
