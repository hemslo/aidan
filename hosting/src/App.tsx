import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {AuthProvider, FirestoreProvider, StorageProvider, useFirebaseApp} from 'reactfire';
import {Authentication, AuthWrapper} from './features/authentication/Authentication';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {Navigation} from './features/navigation/Navigation';
import {Outlet} from 'react-router-dom';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';

export const App = () => {
    const firebaseApp = useFirebaseApp();
    const auth = getAuth(firebaseApp);
    const firestoreInstance = getFirestore(firebaseApp);
    const storageInstance = getStorage(firebaseApp);

    return (
        <AuthProvider sdk={auth}>
            <FirestoreProvider sdk={firestoreInstance}>
                <StorageProvider sdk={storageInstance}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{display: 'flex'}}>
                            <Navigation/>
                            <Box component="main" sx={{p: 3, width: 1}}>
                                <Toolbar/>
                                <Authentication/>
                                <AuthWrapper fallback={<></>}>
                                    <Outlet/>
                                </AuthWrapper>
                            </Box>
                        </Box>
                    </LocalizationProvider>
                </StorageProvider>
            </FirestoreProvider>
        </AuthProvider>
    );
};
