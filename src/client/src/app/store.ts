import { configureStore } from '@reduxjs/toolkit';
import logedUserReducer from '../features/logedUser';
import resetingUserReducer from '../features/resetingUser';
import isRenamedReducer from '../features/isRenamed';
import refreshErrorReducer from '../features/refreshError';

const store = configureStore({
  reducer: {
    logedUser: logedUserReducer,
    resetingUser: resetingUserReducer,
    isRenamed: isRenamedReducer,
    refreshError: refreshErrorReducer,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
