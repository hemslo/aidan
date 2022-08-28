import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import GoogleIcon from '@mui/icons-material/Google';
import LoginIcon from '@mui/icons-material/Login';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth, useSigninCheck } from 'reactfire';
import { ChangeEvent, FormEvent, useCallback, useState } from 'react';

export const AuthWrapper = ({ children, fallback }: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
  const { status, data: signInCheckResult } = useSigninCheck({ requiredClaims: { reader: 'true'} });

  if (!children) {
    throw new Error('Children must be provided');
  }
  if (status === 'loading') {
    return <CircularProgress />
  } else if (signInCheckResult.signedIn && signInCheckResult.hasRequiredClaims) {
    return children as JSX.Element;
  }

  return fallback;
};

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const onEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [setEmail],
  );
  const onPasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    [setPassword],
  );

  const auth = useAuth();
  const onSignInWithGoogle = useCallback(
    () => signInWithPopup(auth, new GoogleAuthProvider()),
    [auth],
  );
  const onSignInWIthEmailAndPassword = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      try {
        await signInWithEmailAndPassword(auth, email, password)
        setErrorMessage('');
      } catch (e) {
        setErrorMessage((e as Error).message);
      }
    },
    [auth, email, password],
  );

  return (
    <Stack spacing={2} component="form" onSubmit={onSignInWIthEmailAndPassword}>
      <FormControl>
        <TextField
          fullWidth
          name="email"
          type="email"
          label="Email"
          onChange={onEmailChange}
        />
      </FormControl>
      <FormControl>
        <TextField
          fullWidth
          name="password"
          type="password"
          label="Password"
          onChange={onPasswordChange}
        />
      </FormControl>
      <FormControl>
        {errorMessage && <FormHelperText error>{errorMessage}</FormHelperText>}
      </FormControl>
      <Button
        type="submit"
        startIcon={<LoginIcon />}
        onClick={onSignInWIthEmailAndPassword}>
        Login
      </Button>
      <Button
        startIcon={<GoogleIcon />}
        onClick={onSignInWithGoogle}>
        Sign in with Google
      </Button>
    </Stack>
  );
};

export function Authentication() {
  const { status, data: signinResult } = useSigninCheck({ requiredClaims: { reader: 'true'} });

  if (status === 'loading') {
    return <></>;
  }

  const { signedIn, hasRequiredClaims } = signinResult;

  if (!signedIn) {
    return <SignInForm />;
  } else if (!hasRequiredClaims) {
    return <div>No enough permission, please contact admin.</div>
  } else {
    return <></>;
  }
};
