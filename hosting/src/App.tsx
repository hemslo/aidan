import { Grid } from '@mui/material';
import { Auth } from './features/auth/Auth';

function App() {
  return (
    <Grid container spacing={2} >
       <Grid item xs={12}>
        <Auth />
      </Grid>
    </Grid>
  );
}

export default App;
