import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query'
import { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import {
  saveOAuth2State,
  selectClientId,
  selectClientSecret,
  selectRefreshToken,
  updateRefreshToken
} from './oauth2Slice';
import { RootState } from '../../app/store';

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
  reducerPath: 'oauth2api',
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

export function fetchBaseQueryWithReauth(fetchBaseQueryArgs: FetchBaseQueryArgs = {}): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> {
  const baseQuery = fetchBaseQuery(fetchBaseQueryArgs);
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (!result.error || result.error.status !== 401) {
      return result;
    }
    const state = api.getState() as RootState;
    const request = {
      clientId: selectClientId(state),
      clientSecret: selectClientSecret(state),
      refreshToken: selectRefreshToken(state),
    };
    const refreshToken = api.dispatch(oauth2Api.endpoints.refreshToken.initiate(request));
    const refreshResult = await refreshToken;
    if (refreshResult.data) {
      api.dispatch(updateRefreshToken(refreshResult.data));
      await api.dispatch(saveOAuth2State(''));
    }
    refreshToken.unsubscribe();
    return await baseQuery(args, api, extraOptions);
  };
}

export const { useGetAccessTokenQuery } = oauth2Api;
