// features/auth/authSlice.ts
import { User } from '@/features/auth/authApi';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  user: User | null;
} = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
