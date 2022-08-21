import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface AuthState {
    clientId: string;
    clientSecret: string;
    projectId: string;
}

const initialState: AuthState = {
    clientId: '',
    clientSecret: '',
    projectId: '',
};


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
    },
});

export const { updateClientId, updateClientSecret, updateProjectId } = authSlice.actions;

export const selectClientId = (state: RootState) => state.auth.clientId;

export const selectClientSecret = (state: RootState) => state.auth.clientSecret;

export const selectProjectId = (state: RootState) => state.auth.projectId;

export default authSlice.reducer;
