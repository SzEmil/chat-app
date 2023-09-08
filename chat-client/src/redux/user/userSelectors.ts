import { authInitialStateType } from './userSlice';

export const selectAuthUser = (state: { user: authInitialStateType }) =>
  state.user;

export const selectAuthUserData = (state: { user: authInitialStateType }) =>
  state.user.user;

  export const selectAuthUserId = (state: { user: authInitialStateType }) =>
  state.user.user.id;

export const selectAuthUserUsername = (state: { user: authInitialStateType }) =>
  state.user.user.username;

export const selectAuthUserEmail = (state: { user: authInitialStateType }) =>
  state.user.user.email;

export const selectAuthUserIsLoggedIn = (state: {
  user: authInitialStateType;
}) => state.user.isLoggedIn;

export const selectAuthUserIsLoading = (state: {
  user: authInitialStateType;
}) => state.user.isLoading;

export const selectAuthUserIsRefreshing = (state: {
  user: authInitialStateType;
}) => state.user.isRefreshing;

export const selectAuthUserError = (state: { user: authInitialStateType }) =>
  state.user.isRefreshing;
