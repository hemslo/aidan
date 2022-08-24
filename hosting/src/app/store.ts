import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { oauth2Api } from '../features/auth/oauth2Api';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { loadState } from '../localstorage';

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [oauth2Api.reducerPath]: oauth2Api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(oauth2Api.middleware),
  preloadedState: persistedState,
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
