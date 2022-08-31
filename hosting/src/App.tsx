import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { AuthProvider, useFirebaseApp, FirestoreProvider, StorageProvider } from 'reactfire';
import { Authentication, AuthWrapper } from './features/authentication/Authentication';
import { Navigation } from './features/navigation/Navigation';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Outlet } from 'react-router-dom';

export const App = () => {
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
                <Outlet />
              </AuthWrapper>
            </Box>
          </Box>
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
};
