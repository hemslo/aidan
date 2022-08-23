import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { saveState } from '../../localstorage';
import { OAuth2AccessTokenResponse, OAuth2RefreshTokenResponse } from './oauth2Api';

export interface AuthState {
    clientId: string;
    clientSecret: string;
    projectId: string;
    code: string;
    access_token: string;
    expires_at: number;
    refresh_token: string;
}

const initialState: AuthState = {
    clientId: '',
    clientSecret: '',
    projectId: '',
    code: '',
    access_token: '',
    refresh_token: '',
    expires_at: 0,
};

export const saveAuthState = createAsyncThunk(
    'auth/saveState',
    async (_: string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        saveState({auth: state.auth})
    }
  );

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateClientId: (state, action: PayloadAction<string>) => {
            state.clientId = action.payload;
        },
        updateClientSecret: (state, action: PayloadAction<string>) => {
            state.clientSecret = action.payload;
        },
        updateProjectId: (state, action: PayloadAction<string>) => {
            state.projectId = action.payload;
        },
        updateCode: (state, action: PayloadAction<string>) => {
            state.code = action.payload;
        },
        updateAccessToken: (state, action: PayloadAction<OAuth2AccessTokenResponse>) => {
            state.code = '';
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.expires_at = Date.now() + action.payload.expires_in * 1000;
        },
        refreshToken: (state, action: PayloadAction<OAuth2RefreshTokenResponse>) => {
            state.code = '';
            state.access_token = action.payload.access_token;
            state.expires_at = Date.now() + action.payload.expires_in * 1000;
        }
    },
});

export const { updateClientId, updateClientSecret, updateProjectId, updateCode, updateAccessToken, refreshToken } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export const selectClientId = (state: RootState) => state.auth.clientId;

export const selectClientSecret = (state: RootState) => state.auth.clientSecret;

export const selectProjectId = (state: RootState) => state.auth.projectId;

export const selectCode = (state: RootState) => state.auth.code;

export const selectAccessToken = (state: RootState) => state.auth.access_token;

export const selectRefreshToken = (state: RootState) => state.auth.refresh_token;

export const selectExpiresAt = (state: RootState) => new Date(state.auth.expires_at);

export default authSlice.reducer;
