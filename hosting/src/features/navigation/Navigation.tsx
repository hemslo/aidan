import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAuth, useSigninCheck } from 'reactfire';
import { useState, MouseEvent } from 'react';

const UserMenu = () => {
    const auth = useAuth();
    const { status, data: signinResult } = useSigninCheck();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
      };

    const handleClose = async () => {
        await auth.signOut();
        setAnchorEl(null);
    };

    if (status === 'loading') {
        return (<CircularProgress color="secondary" />);
    }
    const { user, signedIn } = signinResult;
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
                    ? <Avatar alt={user.displayName} src={user.photoURL} />
                    : <AccountCircleIcon />}
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
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                </Menu>
            </div>);
    }
    return (<></>);
};

export function Navigation() {
    return (
        <AppBar component="nav">
            <Toolbar>
                <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                    Aidan
                </Typography>
                <UserMenu />
            </Toolbar>
        </AppBar>
    );
}
