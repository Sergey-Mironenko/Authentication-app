import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface State {
  isRenamed: boolean;
};

const initialState: State = { isRenamed: false };

export const isRenamedSlice = createSlice({
  name: 'isRenamed',
  initialState,
  reducers: {
    setIsRenamed: (state, action: PayloadAction<boolean>) => {
      return { isRenamed: action.payload };  
    },
  }
});

export default isRenamedSlice.reducer;
export const { actions } = isRenamedSlice;
