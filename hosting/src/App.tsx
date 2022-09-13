import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {AnalyticsProvider, AuthProvider, FirestoreProvider, StorageProvider, useFirebaseApp} from 'reactfire';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import {getStorage} from 'firebase/storage';
import {getAnalytics} from 'firebase/analytics';
import {Provider} from "react-redux";
import {store} from "./app/store";
import CssBaseline from "@mui/material/CssBaseline";
import {Live} from "./features/live/Live";
import {OAuth2} from "./features/oauth2/OAuth2";
import {Dashboard} from "./features/dashboard/Dashboard";
import React from "react";
import {Layout} from "./Layout";

export const App = () => {
    const firebaseApp = useFirebaseApp();
    const auth = getAuth(firebaseApp);
    const firestoreInstance = getFirestore(firebaseApp);
    const storageInstance = getStorage(firebaseApp);
    const analytics = getAnalytics(firebaseApp);

    return (
        <Provider store={store}>
            <CssBaseline/>
            <AnalyticsProvider sdk={analytics}>
                <AuthProvider sdk={auth}>
                    <FirestoreProvider sdk={firestoreInstance}>
                        <StorageProvider sdk={storageInstance}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <BrowserRouter>
                                    <Routes>
                                        <Route path="/" element={<Layout/>}>
                                            <Route index element={<Live/>}/>
                                            <Route path="auth" element={<OAuth2/>}/>
                                            <Route path="dashboard" element={<Dashboard/>}/>
                                        </Route>
                                    </Routes>
                                </BrowserRouter>
                            </LocalizationProvider>
                        </StorageProvider>
                    </FirestoreProvider>
                </AuthProvider>
            </AnalyticsProvider>
        </Provider>
    );
};
