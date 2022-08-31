import Grid from '@mui/material/Grid';
import { Camera } from '../camera/Camera';
import { OAuth2 } from '../oauth2/OAuth2';

export const Live = () => {
    return (<Grid container spacing={2} >
        <Grid item xs={12}>
            <Camera />
        </Grid>
        <Grid item xs={12}>
            <OAuth2 />
        </Grid>
    </Grid>);
};
