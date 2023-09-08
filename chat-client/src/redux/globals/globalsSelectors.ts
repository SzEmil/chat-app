import { globalsStateType } from './globalsSlice';
export const selectSocket = (state: { globals: globalsStateType }) =>
  state.globals.socket;

export const selectAppServerConnection = (state: {
  globals: globalsStateType;
}) => state.globals.serverConnection;

export const selectSocketReady = (state: { globals: globalsStateType }) =>
  state.globals.socketReady;
