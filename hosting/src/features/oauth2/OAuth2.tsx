import {
    useLocation, useNavigate
} from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
    saveOAuth2State,
    selectAccessToken,
    selectClientId,
    selectClientSecret,
    selectCode,
    selectExpiresAt,
    selectProjectId,
    selectRefreshToken,
    updateAccessToken,
    updateClientId,
    updateClientSecret,
    updateCode,
    updateProjectId,
    updateRefreshToken,
} from './authSlice';
import { useEffect, useState } from 'react';
import { useGetAccessTokenQuery, useRefreshTokenQuery } from './oauth2Api';
import { useSigninCheck } from 'reactfire';

const OAUTH_SCOPE = 'https://www.googleapis.com/auth/sdm.service';
const OAUTH_ENDPOINT = 'https://nestservices.google.com/partnerconnections/';
const REFRESH_THRESHOLD = 1000 * 60 * 5;

export function OAuth2() {
    const clientId = useAppSelector(selectClientId);
    const clientSecret = useAppSelector(selectClientSecret);
    const projectId = useAppSelector(selectProjectId);
    const code = useAppSelector(selectCode);
    const accessToken = useAppSelector(selectAccessToken);
    const refreshToken = useAppSelector(selectRefreshToken);
    const expiresAt = useAppSelector(selectExpiresAt);
    const [now, setNow] = useState(new Date());
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { search } = useLocation();

    useEffect(() => {
        if (search) {
            const params = new URLSearchParams(search);
            dispatch(updateCode(params.get('code') || ''));
        }
    }, [search, dispatch]);

    const redirectUri = window.location.origin + '/auth';
    const oauthEndpoint = OAUTH_ENDPOINT + projectId + '/auth';

    const { data: oAuth2AccessTokenResponse } = useGetAccessTokenQuery({
        clientId,
        clientSecret,
        code,
        redirectUri,
    }, { skip: !code || !clientId || !clientSecret || !redirectUri });

    useEffect(() => {
        if (oAuth2AccessTokenResponse) {
            dispatch(updateAccessToken(oAuth2AccessTokenResponse))
            dispatch(saveOAuth2State(''));
            navigate('/');
        }
    }, [oAuth2AccessTokenResponse, dispatch, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const { data: oAuth2RefreshTokenResponse } = useRefreshTokenQuery({
        clientId,
        clientSecret,
        refreshToken,
    }, { skip: !refreshToken || !clientId || !clientSecret || expiresAt.getTime() - now.getTime() > REFRESH_THRESHOLD });

    useEffect(() => {
        if (oAuth2RefreshTokenResponse) {
            dispatch(updateRefreshToken(oAuth2RefreshTokenResponse))
            dispatch(saveOAuth2State(''));
        }
    }, [oAuth2RefreshTokenResponse, dispatch]);

    const { data: signInCheckResult } = useSigninCheck({ requiredClaims: { admin: 'true' } });

    return signInCheckResult && signInCheckResult.hasRequiredClaims
        ? (
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    placeholder="GCP Client Id"
                    label="GCP Client Id"
                    value={clientId}
                    onChange={(e) => dispatch(updateClientId(e.target.value))}
                />
                <TextField
                    fullWidth
                    placeholder="GCP Client Secret"
                    label="GCP Client Secret"
                    value={clientSecret}
                    onChange={(e) => dispatch(updateClientSecret(e.target.value))}
                />
                <TextField
                    fullWidth
                    placeholder="Device Access Project Id"
                    label="Device Access Project Id"
                    value={projectId}
                    onChange={(e) => dispatch(updateProjectId(e.target.value))}
                />
                <form method="GET" action={oauthEndpoint} onSubmit={() => dispatch(saveOAuth2State(''))}>
                    <input type="hidden" name="access_type" value="offline" />
                    <input type="hidden" name="client_id" value={clientId} />
                    <input type="hidden" name="include_granted_scopes" value="true" />
                    <input type="hidden" name="prompt" value="consent" />
                    <input type="hidden" name="redirect_uri" value={redirectUri} />
                    <input type="hidden" name="response_type" value="code" />
                    <input type="hidden" name="scope" value={OAUTH_SCOPE} />
                    <input type="hidden" name="state" value="pass-through value" />
                    <Button type="submit">Link</Button>
                </form>
                <TextField
                    fullWidth
                    multiline
                    label="Access Token"
                    value={accessToken}
                    disabled
                />
                <TextField
                    fullWidth
                    multiline
                    label="Refresh Token"
                    value={refreshToken}
                    disabled
                />
                <TextField
                    fullWidth
                    multiline
                    label="Exprires At"
                    value={expiresAt.toISOString()}
                    disabled
                />
            </Stack>
        )
        : (<></>);
};
