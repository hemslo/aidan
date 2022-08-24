import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface CameraState {
    deviceId: string;
}

const initialState = {
    deviceId: '',
}

export const cameraSlice = createSlice({
    name: 'camera',
    initialState,
    reducers: {
        updateDeviceId: (state, action: PayloadAction<string>) => {
            state.deviceId = action.payload;
        },
    },
});

export const { updateDeviceId } = cameraSlice.actions;

export const selectDeviceId = (state: RootState) => state.camera.deviceId;

export default cameraSlice.reducer;
