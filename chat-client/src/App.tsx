import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { NotFound } from './pages/NotFound/NotFound';
import { RestrictedRoute } from './components/RestrictedRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './redux/store';
import { refreshUser } from './redux/user/userOperations';

export let socket: any;
const App = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const refreshUserData = async () => {
      await dispatch(refreshUser());
    };

    refreshUserData();
  }, []);

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
