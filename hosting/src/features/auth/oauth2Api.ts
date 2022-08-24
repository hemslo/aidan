import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface OAuth2AccessTokenRequest {
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string,
};

export interface OAuth2AccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

export interface OAuth2RefreshTokenRequest {
  clientId: string,
  clientSecret: string,
  refreshToken: string,
};

export interface OAuth2RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export const oauth2Api = createApi({
  reducerPath: 'oauth2',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://www.googleapis.com/oauth2/v4/' }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<OAuth2AccessTokenResponse, OAuth2AccessTokenRequest>({
      query: (request: OAuth2AccessTokenRequest) => ({
        url: 'token',
        method: 'POST',
        params: {
          grant_type: 'authorization_code',
          client_id: request.clientId,
          client_secret: request.clientSecret,
          code: request.code,
          redirect_uri: request.redirectUri,
        }
      }),
    }),
    refreshToken: builder.query<OAuth2RefreshTokenResponse, OAuth2RefreshTokenRequest>({
      query: (request: OAuth2RefreshTokenRequest) => ({
        url: 'token',
        method: 'POST',
        params: {
          grant_type: 'refresh_token',
          client_id: request.clientId,
          client_secret: request.clientSecret,
          refresh_token: request.refreshToken,
        }
      }),
    }),
  }),
});

export const { useGetAccessTokenQuery, useRefreshTokenQuery } = oauth2Api;
