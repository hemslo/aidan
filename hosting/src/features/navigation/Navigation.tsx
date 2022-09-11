import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {clearState} from '../../localstorage';
import {useAuth, useSigninCheck} from 'reactfire';
import {MouseEvent, useCallback, useState} from 'react';
import logo from '../../logo.svg';

const UserMenu = () => {
    const auth = useAuth();
    const {status, data: signinResult} = useSigninCheck();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, [setAnchorEl]);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

    const handleLogout = async () => {
        await auth.signOut();
        clearState();
        setAnchorEl(null);
    };

    if (status === 'loading') {
        return (<CircularProgress color="secondary"/>);
    }
    const {user, signedIn} = signinResult;
    if (signedIn && user) {
        return (
            <div>
                <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                >
                    {user.photoURL && user.displayName
                        ? <Avatar alt={user.displayName} src={user.photoURL}/>
                        : <AccountCircleIcon/>}
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </div>);
    }
    return (<></>);
};

const Brand = () => (
    <Typography
        variant="h5"
        noWrap
        component="a"
        href="/"
        sx={{
            mr: 2,
            display: {xs: 'none', md: 'flex'},
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
        }}>
        <Box
            component="img"
            sx={{
                height: 32,
                mr: 2,
                display: {xs: 'none', md: 'flex'},
            }}
            alt="Aidan's logo"
            src={logo}
        />
        Aidan
    </Typography>
);

const NavItems = () => (<Box sx={{flexGrow: 1, display: 'flex'}}>
    <List sx={{display: 'flex'}}>
        <ListItem key='Live' disablePadding>
            <ListItemButton href='/'>
                <ListItemText primary='Live'/>
            </ListItemButton>
        </ListItem>
        <ListItem key='Dashboard' disablePadding>
            <ListItemButton href='/dashboard'>
                <ListItemText primary='Dashboard'/>
            </ListItemButton>
        </ListItem>
    </List>
</Box>);


export const Navigation = () => {
    return (
        <AppBar component="nav">
            <Toolbar>
                <Brand/>
                <Divider/>
                <NavItems/>
                <Divider/>
                <UserMenu/>
            </Toolbar>
        </AppBar>
    );
};
