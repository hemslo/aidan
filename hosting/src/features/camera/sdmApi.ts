import {createApi} from '@reduxjs/toolkit/query/react';
import {RootState} from '../../app/store';
import {fetchBaseQueryWithReauth} from '../oauth2/oauth2Api';

export interface Device {
    name: string;
    type: string;
    traits: object;
    parentRelations: object[];
}

export interface ListDevicesResponse {
    devices: Device[]
}

export interface GenerateWebRtcStreamResponse {
    results: {
        answerSdp: string,
        expiresAt: string,
        mediaSessionId: string,
    }
}

export interface GenerateWebRtcStreamRequest {
    projectId: string,
    deviceId: string,
    offerSdp: string,
}

export interface StopWebRtcStreamRequest {
    projectId: string,
    deviceId: string,
    mediaSessionId: string,
}

export const sdmApi = createApi({
    reducerPath: 'sdmapi',
    baseQuery: fetchBaseQueryWithReauth({
        baseUrl: 'https://smartdevicemanagement.googleapis.com/v1/',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).oauth2.access_token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers;
        }
    }),
    tagTypes: ['WebRtcStream'],
    endpoints: (builder) => ({
        listDevices: builder.query<ListDevicesResponse, string>({
            query: (projectId: string) => ({
                url: `enterprises/${projectId}/devices`,
                method: 'GET',
            }),
        }),
        generateWebRtcStream: builder.query<GenerateWebRtcStreamResponse, GenerateWebRtcStreamRequest>({
            query: (request: GenerateWebRtcStreamRequest) => ({
                url: `enterprises/${request.projectId}/devices/${request.deviceId}:executeCommand`,
                method: 'POST',
                body: {
                    command: "sdm.devices.commands.CameraLiveStream.GenerateWebRtcStream",
                    params: {
                        offerSdp: request.offerSdp,
                    },
                },
            }),
            providesTags: ['WebRtcStream'],
        }),
        stopWebRtcStream: builder.mutation<object, StopWebRtcStreamRequest>({
            query: (request: StopWebRtcStreamRequest) => ({
                url: `enterprises/${request.projectId}/devices/${request.deviceId}:executeCommand`,
                method: 'POST',
                body: {
                    command: "sdm.devices.commands.CameraLiveStream.StopWebRtcStream",
                    params: {
                        mediaSessionId: request.mediaSessionId,
                    },
                },
            }),
            invalidatesTags: ['WebRtcStream'],
        }),
    }),
});

export const {useListDevicesQuery, useGenerateWebRtcStreamQuery, useStopWebRtcStreamMutation} = sdmApi;
