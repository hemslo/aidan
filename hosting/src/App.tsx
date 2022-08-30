import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import { AuthProvider, useFirebaseApp, FirestoreProvider, StorageProvider } from 'reactfire';
import { Authentication, AuthWrapper } from './features/authentication/Authentication';
import { Camera } from './features/camera/Camera';
import { Navigation } from './features/navigation/Navigation';
import { OAuth2 } from './features/oauth2/OAuth2';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function App() {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);
  const firestoreInstance = getFirestore(firebaseApp);
  const storageInstance = getStorage(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <FirestoreProvider sdk={firestoreInstance}>
        <StorageProvider sdk={storageInstance}>
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
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;
