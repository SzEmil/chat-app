import { createSlice } from '@reduxjs/toolkit';
import { register, logIn, logOut, refreshUser } from './userOperations';

export type authInitialStateType = {
  user: {
    id: number | null | undefined;
    username: string | null;
    email: string | null;
  };
  token: string | null;
  isRefreshing: boolean;
  isLoggedIn: boolean;
  error: any;
  isLoading: boolean;
};

const authInitialState: authInitialStateType = {
  user: {
    username: null,
    email: null,
    id: null,
  },
  token: null,
  isLoggedIn: false,
  isRefreshing: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'user',
  initialState: authInitialState,
  reducers: {
    importInfoData: state => state,
    pageLoaded: state => {
      state.isLoading = false;
    },
    logoutSuccess: state => {
      (state.token = null),
        (state.error = null),
        (state.isLoggedIn = false),
        (state.user.email = null);
    },
  },
  extraReducers: builder => {
    try {
      builder.addCase(register.pending, (state: authInitialStateType) => {
        state.error = null;
        state.isLoading = true;
        state.isRefreshing = true;
      });
      builder.addCase(
        register.rejected,
        (state: authInitialStateType, action: { payload: any }) => {
          (state.isLoading = false),
            (state.isLoggedIn = false),
            (state.isRefreshing = false),
            (state.error = action.payload);
          (state.user.email = null), (state.user.username = null);
          state.user.id = null;
        }
      );
      builder.addCase(
        register.fulfilled,
        (
          state: authInitialStateType,
          action: {
            payload: {
              username: string | null;
              email: string | null;
              avatarURL: string;
              emailVerification: boolean;
              token: string | null;
              id: number | null;
            };
          }
        ) => {
          state.user.username = action.payload.username;
          state.user.email = action.payload.email;
          state.user.id = action.payload.id;
          state.token = action.payload.token;
          state.isLoggedIn = true;
          state.error = null;
          state.isRefreshing = false;
          state.isLoading = false;
        }
      );

      builder.addCase(logIn.pending, (state: authInitialStateType) => {
        state.error = null;
        state.isLoading = true;
        state.isRefreshing = true;
      });
      builder.addCase(
        logIn.rejected,
        (state: authInitialStateType, action: { payload: any }) => {
          (state.isLoading = false),
            (state.isLoggedIn = false),
            (state.isRefreshing = false),
            (state.error = action.payload);
          (state.user.email = null), (state.user.id = null);
        }
      );
      builder.addCase(
        logIn.fulfilled,
        (
          state: authInitialStateType,
          action: {
            payload: {
              token: string | null;
              user: {
                username: string | null;
                email: string | null;
                token: string | null;
                id: number | null;
              };
            };
          }
        ) => {
          state.user.username = action.payload.user.username;
          state.user.email = action.payload.user.email;
          state.token = action.payload.token;
          state.user.id = action.payload.user.id;
          state.isLoggedIn = true;
          state.error = null;
          state.isRefreshing = false;
          state.isLoading = false;
        }
      );

      builder.addCase(refreshUser.pending, (state: authInitialStateType) => {
        state.error = null;
        state.isLoading = true;
        state.isRefreshing = true;
      });
      builder.addCase(
        refreshUser.rejected,
        (state: authInitialStateType, action: { payload: any }) => {
          (state.isLoading = false),
            (state.isLoggedIn = false),
            (state.isRefreshing = false),
            (state.error = action.payload);
          (state.user.email = null), (state.user.username = null);
          state.user.id = null;
        }
      );
      builder.addCase(
        refreshUser.fulfilled,
        (
          state: authInitialStateType,
          action: {
            payload: any;
          }
        ) => {
          state.user.username = action.payload.username;
          state.user.email = action.payload.email;
          state.user.id = action.payload.id;

          state.isLoggedIn = true;
          state.error = null;
          state.isRefreshing = false;
          state.isLoading = false;
        }
      );

      builder.addCase(logOut.pending, state => {
        state.isLoading = true;
      });
      builder.addCase(logOut.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
      builder.addCase(logOut.fulfilled, state => {
        (state.token = null),
          (state.error = null),
          (state.isLoggedIn = false),
          (state.user.email = null),
          (state.user.username = null);

        state.user.id = null;
        state.isLoading = false;
      });
    } catch (error) {
      console.log(error);
    }
  },
});

export const { importInfoData, logoutSuccess, pageLoaded } = authSlice.actions;
export const userReducer = authSlice.reducer;
