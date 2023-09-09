import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ComponentType } from 'react';

type RestrictedRouteProps = {
  component: ComponentType;
  redirectTo?: string;
};

export const RestrictedRoute = ({
  component: Component,
  redirectTo = '/',
}: RestrictedRouteProps) => {
  const { isLoggedIn, isRefreshing } = useAuth();


  return isLoggedIn == true && isRefreshing == false ? (
    <Navigate to={redirectTo} />
  ) : (
    <Component />
  );
};
