import {useLocation, useNavigate} from 'react-router-dom';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {
    loadState,
    OAuth2State,
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
} from './oauth2Slice';
import {useEffect} from 'react';
import {useGetAccessTokenQuery} from './oauth2Api';
import {useFirestore, useFirestoreDocData, useSigninCheck} from 'reactfire';
import {doc} from 'firebase/firestore';

const OAUTH_SCOPE = 'https://www.googleapis.com/auth/sdm.service';
const OAUTH_ENDPOINT = 'https://nestservices.google.com/partnerconnections/';

export function OAuth2() {
    const clientId = useAppSelector(selectClientId);
    const clientSecret = useAppSelector(selectClientSecret);
    const projectId = useAppSelector(selectProjectId);
    const code = useAppSelector(selectCode);
    const accessToken = useAppSelector(selectAccessToken);
    const refreshToken = useAppSelector(selectRefreshToken);
    const expiresAt = useAppSelector(selectExpiresAt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const firestore = useFirestore();

    const ref = doc(firestore, 'oauth2', 'state');
    const {status: oauth2Status, data: oauth2State} = useFirestoreDocData(ref);

    useEffect(() => {
        if (oauth2Status !== 'loading' && oauth2State) {
            dispatch(loadState(oauth2State as OAuth2State));
        }
    }, [oauth2Status, oauth2State, dispatch]);

    const {search} = useLocation();

    useEffect(() => {
        if (search) {
            const params = new URLSearchParams(search);
            dispatch(updateCode(params.get('code') || ''));
        }
    }, [search, dispatch]);

    const redirectUri = window.location.origin + '/auth';
    const oauthEndpoint = OAUTH_ENDPOINT + projectId + '/auth';

    const {data: oAuth2AccessTokenResponse} = useGetAccessTokenQuery({
        clientId,
        clientSecret,
        code,
        redirectUri,
    }, {skip: !code || !clientId || !clientSecret || !redirectUri});

    useEffect(() => {
        if (oAuth2AccessTokenResponse) {
            dispatch(updateAccessToken(oAuth2AccessTokenResponse))
            dispatch(saveOAuth2State(''));
            navigate('/');
        }
    }, [oAuth2AccessTokenResponse, dispatch, navigate]);

    const {data: signInCheckResult} = useSigninCheck({requiredClaims: {write: 'true'}});

    return signInCheckResult?.hasRequiredClaims
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
                    <input type="hidden" name="access_type" value="offline"/>
                    <input type="hidden" name="client_id" value={clientId}/>
                    <input type="hidden" name="include_granted_scopes" value="true"/>
                    <input type="hidden" name="prompt" value="consent"/>
                    <input type="hidden" name="redirect_uri" value={redirectUri}/>
                    <input type="hidden" name="response_type" value="code"/>
                    <input type="hidden" name="scope" value={OAUTH_SCOPE}/>
                    <input type="hidden" name="state" value="pass-through value"/>
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
}
