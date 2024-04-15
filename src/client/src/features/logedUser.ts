import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { actions as refreshErrorActions} from './refreshError';
import { User } from '../types/User';

interface State {
  logedUser: User | null;
};

const initialState: State = { logedUser: null };

export const logedUserSlice = createSlice({
  name: 'logedUser',
  initialState,
  reducers: {
    setLogedUser: (state, action: PayloadAction<User>) => {
      return { logedUser: action.payload };
    },
    removeLogedUser: () => {
      return { logedUser: null };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      refreshErrorActions.handleRefreshFail.type,
      () => {
        return { logedUser: null };
      },
    )
  }
});

export default logedUserSlice.reducer;
export const { actions } = logedUserSlice;
