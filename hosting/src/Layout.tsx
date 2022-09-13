import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import {Authentication, AuthWrapper} from './features/authentication/Authentication';
import {Navigation} from './features/navigation/Navigation';
import {Outlet, useLocation} from 'react-router-dom';
import {useAnalytics} from "reactfire";
import {useEffect} from "react";
import {logEvent} from 'firebase/analytics';

export const Layout = () => {
    const analytics = useAnalytics();
    const location = useLocation();

    useEffect(() => {
        logEvent(analytics, 'page_view', {page_location: location.pathname});
    }, [location, analytics]);

    return (
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
    );
};
