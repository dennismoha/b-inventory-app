import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
  user: {
    email: string;
    username: string;
    role: string; // Assuming role is a string, adjust as necessary
  };
  accessToken: string;
};

const initialState: AuthState = {
  user: {
    email: '',
    username: '',
    role: '' // Initialize role as an empty string
  },
  accessToken: ''
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
    },
    setClearCredentials: (state) => {
      console.log('cleeaing credentials');
      state.user = {
        email: '',
        username: '',
        role: '' // Reset user information on logout
      };
      state.accessToken = '';
    }
  }
});

export const { setCredentials, setClearCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: { user: null } }) => state.auth.user;
export const selectCurrentToken = (state: { auth: { token: null } }) => state.auth.token;
