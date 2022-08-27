import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import { getAuth } from 'firebase/auth';
import { AuthProvider, useFirebaseApp } from 'reactfire';
import { OAuth2 } from './features/oauth2/OAuth2';
import { Camera } from './features/camera/Camera';
import { Authentication, AuthWrapper } from './features/authentication/Authentication';
import { Navigation } from './features/navigation/Navigation';

function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <Box sx={{ display: 'flex' }}>
        <Navigation />
        <Box component="main" sx={{ p: 3, width: 1 }}>
          <Toolbar />
          <Authentication />
          <AuthWrapper fallback={<></>}>
            <Grid container spacing={2} >
              <Grid item xs={12}>
                <Camera />
              </Grid>
              <Grid item xs={12}>
                <OAuth2 />
              </Grid>
            </Grid>
          </AuthWrapper>
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
