import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ComponentType } from 'react';
import { getSocket } from '../services/socketService';

type RestrictedRouteProps = {
  component: ComponentType;
  redirectTo?: string;
};

export const RestrictedRoute = ({
  component: Component,
  redirectTo = '/',
}: RestrictedRouteProps) => {
  const { isLoggedIn } = useAuth();
  const socket = getSocket();

  return isLoggedIn == true  ? (
    <Navigate to={redirectTo} />
  ) : (
    <Component />
  );
};
