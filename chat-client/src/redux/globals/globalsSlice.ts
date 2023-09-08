import { createSlice } from '@reduxjs/toolkit';

export type globalsStateType = {
  serverConnection: boolean;
  socketReady: boolean;
  socket: any;
};

const globalsInitialState: globalsStateType = {
  serverConnection: false,
  socketReady: false,
  socket: null,
};

const globalsSlice = createSlice({
  name: 'globals',
  initialState: globalsInitialState,
  reducers: {
    importInfoData: state => state,
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setSocketReady: (state, action) => {
      state.socketReady = action.payload;
    },
    setServerConnection: (state, action) => {
      state.serverConnection = action.payload;
    },
  },
  extraReducers: {},
});

export const {
  importInfoData,
  setSocket,
  setSocketReady,
  setServerConnection,
} = globalsSlice.actions;
export const globalsReducer = globalsSlice.reducer;
