import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ComponentType } from 'react';
import { getSocket } from '../services/socketService';

type ProtectedRouteProps = {
  component: ComponentType;
  redirectTo?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  redirectTo = '/',
}) => {
  const socket = getSocket();
  const { isLoggedIn, isRefreshing } = useAuth();

  const shouldRedirect = isLoggedIn === true;
  console.log(shouldRedirect);
  return shouldRedirect ? <Component /> : <Navigate to={redirectTo} />;
};
