import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Auth } from './features/auth/Auth';
import { Camera } from './features/camera/Camera';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <Typography variant="h3" component="div">
            Aidan
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3, width: 1 }}>
        <Toolbar />
        <Grid container spacing={2} >
          <Grid item xs={12}>
            <Auth />
          </Grid>
          <Grid item xs={12}>
            <Camera />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
