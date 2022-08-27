import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import GoogleIcon from '@mui/icons-material/Google';
import { Auth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth, useSigninCheck } from 'reactfire';
import { useCallback } from 'react';

const signInWithGoogle = async (auth: Auth) => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export const AuthWrapper = ({ children, fallback }: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
  const { status, data: signInCheckResult } = useSigninCheck();

  if (!children) {
    throw new Error('Children must be provided');
  }
  if (status === 'loading') {
    return <CircularProgress />
  } else if (signInCheckResult.signedIn) {
    return children as JSX.Element;
  }

  return fallback;
};

const SignInForm = () => {
  const auth = useAuth();
  const onSignInWithGoogle = useCallback(() => signInWithGoogle(auth), [auth]);

  return (
    <Container>
      <Button
        startIcon={<GoogleIcon />}
        onClick={onSignInWithGoogle}>
        Sign in with Google
      </Button>
    </Container>
  );
};

export function Authentication() {
  const { status, data: signinResult } = useSigninCheck();

  if (status === 'loading') {
    return <></>;
  }

  const { signedIn } = signinResult;

  if (!signedIn) {
    return <SignInForm />;
  } else {
    return <></>;
  }
};
