import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/User';

interface State {
  resetingUser: User | null;
};

const initialState: State = { resetingUser: null };

const resetingUserSlice = createSlice({
  name: 'resetingUser',
  initialState,
  reducers: {
    setResetingUser: (state, action: PayloadAction<User>) => {
      return { resetingUser: action.payload };
    },
    removeResetingUser: () => {
      return { resetingUser: null };
    },
  }
});

export default resetingUserSlice.reducer;
export const { actions } = resetingUserSlice;
