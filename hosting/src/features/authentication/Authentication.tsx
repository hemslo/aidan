import * as React from 'react';
import { useAuth, useSigninCheck } from 'reactfire';
import { Auth, GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const signOut = async (auth: Auth) => await auth.signOut();
const signIn = async (auth: Auth) => {
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

type UserDetailsProps = {
  user: User;
}

const UserDetails = ({ user }: UserDetailsProps) => {
  const auth = useAuth();

  return (
    <>
      <div title="Displayname">{user.displayName}</div>
      <div title="Providers">
        <ul>
          {user.providerData?.map(profile => (
            <li key={profile?.providerId}>{profile?.providerId}</li>
          ))}
        </ul>
      </div>
      <div title="Sign Out">
        <Button onClick={() => signOut(auth)}>Sign Out</Button>
      </div>
    </>
  );
};

const SignInForm = () => {
  const auth = useAuth();

  return (
    <div title="Sign-in form">
      <Button onClick={() => signIn(auth)}>Sign in with Google</Button>
    </div>
  );
};

export const Authentication = () => {
  const { status, data: signinResult } = useSigninCheck();

  if (status === 'loading') {
    return <CircularProgress />;
  }

  const { signedIn, user } = signinResult;

  if (signedIn) {
    return <UserDetails user={user} />;
  } else {
    return <SignInForm />;
  }
};
