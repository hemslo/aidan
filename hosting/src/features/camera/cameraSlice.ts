import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface CameraState {
    deviceId: string;
    mediaSessionId: string;
};

const initialState = {
    deviceId: '',
    mediaSessionId: '',
};

export interface GenerateWebRtcStreamResponsePayload {
    answerSdp: string;
    mediaSessionId: string;
};

export const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        updateDeviceId: (state, action: PayloadAction<string>) => {
            state.deviceId = action.payload;
        },
        updateMediaSessionId: (state, action: PayloadAction<string>) => {
            state.mediaSessionId = action.payload;
        },
    },
});

export const { updateDeviceId, updateMediaSessionId } = cameraSlice.actions;

export const selectDeviceId = (state: RootState) => state.camera.deviceId;

export const selectMediaSessionId = (state: RootState) => state.camera.mediaSessionId;

export default cameraSlice.reducer;
