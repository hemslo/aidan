import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { RootState } from '../../app/store';
import { saveState } from '../../localstorage';
import { OAuth2AccessTokenResponse, OAuth2RefreshTokenResponse } from './oauth2Api';

export interface OAuth2State {
    clientId: string;
    clientSecret: string;
    projectId: string;
    code: string;
    access_token: string;
    expires_at: number;
    refresh_token: string;
};

const initialState: OAuth2State = {
    clientId: '',
    clientSecret: '',
    projectId: '',
    code: '',
    access_token: '',
    refresh_token: '',
    expires_at: 0,
};

export const saveOAuth2State = createAsyncThunk(
    'oauth2/saveState',
    async (_: string, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        saveState({ oauth2: state.oauth2 })
        const db = getFirestore(getApp());
        await setDoc(doc(db, 'oauth2', 'state'), state.oauth2);
    }
);

export const oauth2Slice = createSlice({
    name: 'oauth2',
    initialState,
    reducers: {
        loadState: (state, action: PayloadAction<OAuth2State>) => {
            state.clientId = action.payload.clientId;
            state.clientSecret = action.payload.clientSecret;
            state.projectId = action.payload.projectId;
            state.code = action.payload.code;
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
            state.expires_at = action.payload.expires_at;
        },
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
        updateRefreshToken: (state, action: PayloadAction<OAuth2RefreshTokenResponse>) => {
            state.code = '';
            state.access_token = action.payload.access_token;
            state.expires_at = Date.now() + action.payload.expires_in * 1000;
        }
    },
});

export const {
    loadState,
    updateClientId,
    updateClientSecret,
    updateProjectId,
    updateCode,
    updateAccessToken,
    updateRefreshToken,
} = oauth2Slice.actions;

export const selectAuth = (state: RootState) => state.oauth2;

export const selectClientId = (state: RootState) => state.oauth2.clientId;

export const selectClientSecret = (state: RootState) => state.oauth2.clientSecret;

export const selectProjectId = (state: RootState) => state.oauth2.projectId;

export const selectCode = (state: RootState) => state.oauth2.code;

export const selectAccessToken = (state: RootState) => state.oauth2.access_token;

export const selectRefreshToken = (state: RootState) => state.oauth2.refresh_token;

export const selectExpiresAt = (state: RootState) => new Date(state.oauth2.expires_at);

export default oauth2Slice.reducer;
