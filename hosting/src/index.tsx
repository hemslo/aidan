import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import {Provider} from 'react-redux';
import {store} from './app/store';
import {App} from './App';
import reportWebVitals from './reportWebVitals';
import {FirebaseAppProvider} from 'reactfire';
import {firebaseConfig} from './firebaseConfig';
import {Live} from './features/live/Live';
import {OAuth2} from './features/oauth2/OAuth2';
import {Dashboard} from './features/dashboard/Dashboard';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <FirebaseAppProvider firebaseConfig={firebaseConfig}>
            <Provider store={store}>
                <CssBaseline/>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<App/>}>
                            <Route index element={<Live/>}/>
                            <Route path="auth" element={<OAuth2/>}/>
                            <Route path="dashboard" element={<Dashboard/>}/>
                        </Route>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </FirebaseAppProvider>,
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
