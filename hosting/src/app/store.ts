import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cameraReducer from '../features/camera/cameraSlice';
import { oauth2Api } from '../features/auth/oauth2Api';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { loadState } from '../localstorage';
import { sdmApi } from '../features/camera/sdmApi';

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    camera: cameraReducer,
    [oauth2Api.reducerPath]: oauth2Api.reducer,
    [sdmApi.reducerPath]: sdmApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(oauth2Api.middleware).concat(sdmApi.middleware),
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
