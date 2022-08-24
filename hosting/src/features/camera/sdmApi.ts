import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../../app/store';

export interface Device {
  name: string;
  type: string;
  traits: object;
  parentRelations: object[];
};

export interface ListDevicesResponse {
  devices: Device[]
};

export const sdmApi = createApi({
  reducerPath: 'sdm',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://smartdevicemanagement.googleapis.com/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.access_token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    listDevices: builder.query<ListDevicesResponse, string>({
      query: (parent: string) => ({
        url: `enterprises/${parent}/devices`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useListDevicesQuery } = sdmApi;
