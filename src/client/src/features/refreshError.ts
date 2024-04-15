import { createSlice } from '@reduxjs/toolkit';

interface State {
  refreshError: boolean;
};

const initialState: State = { refreshError: false };

export const refreshErrorSlice = createSlice({
  name: 'refreshError',
  initialState,
  reducers: {
    handleRefreshFail: () => {
      localStorage.removeItem('accessToken');
      return { refreshError: true };
    },
    removeRefreshError: () => {
      return { refreshError: false }
    },
  }
});

export default refreshErrorSlice.reducer;
export const { actions } = refreshErrorSlice;
