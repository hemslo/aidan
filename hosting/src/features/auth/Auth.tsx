import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
    selectClientId,
    selectClientSecret,
    selectProjectId,
    updateClientId,
    updateClientSecret,
    updateProjectId,
} from './authSlice';

const OAUTH_SCOPE = "https://www.googleapis.com/auth/sdm.service";
const OAUTH_ENDPOINT = "https://nestservices.google.com/partnerconnections/";

export function Auth() {
    const clientId = useAppSelector(selectClientId);
    const clientSecret = useAppSelector(selectClientSecret);
    const projectId = useAppSelector(selectProjectId);
    const dispatch = useAppDispatch();

    const redirectURI = window.location.origin + '/auth';
    const oauthEndpoint = OAUTH_ENDPOINT + projectId + "/auth";
    const params = {
        'access_type': 'offline',
        'client_id': clientId,
        'include_granted_scopes': 'true',
        'prompt': 'consent',
        'redirect_uri': redirectURI,
        'response_type': 'code',
        'scope': OAUTH_SCOPE,
        'state': 'pass-through value'
    };

    return (
        <Stack>
            <TextField
                placeholder="GCP Client Id"
                label="GCP Client Id"
                value={clientId}
                onChange={(e) => dispatch(updateClientId(e.target.value))}
            />
            <TextField
                placeholder="GCP Client Secret"
                label="GCP Client Secret"
                value={clientSecret}
                onChange={(e) => dispatch(updateClientSecret(e.target.value))}
            />
            <TextField
                placeholder="Device Access Project Id"
                label="Device Access Project Id"
                value={projectId}
                onChange={(e) => dispatch(updateProjectId(e.target.value))}
            />
            <form method="GET" action={oauthEndpoint}>
                <input type="hidden" name="access_type" value="offline" />
                <input type="hidden" name="client_id" value={clientId} />
                <input type="hidden" name="include_granted_scopes" value="true" />
                <input type="hidden" name="prompt" value="consent" />
                <input type="hidden" name="redirect_uri" value={redirectURI} />
                <input type="hidden" name="response_type" value="code" />
                <input type="hidden" name="scope" value={OAUTH_SCOPE} />
                <input type="hidden" name="state" value="pass-through value" />
                <Button type="submit">Link</Button>
            </form>
        </Stack>
    );
}
