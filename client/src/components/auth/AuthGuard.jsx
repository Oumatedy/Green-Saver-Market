import { SignedIn, SignedOut } from '@clerk/clerk-react';
import AuthLanding from './AuthLanding';

export default function AuthGuard({ children }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <AuthLanding />
      </SignedOut>
    </>
  );
}
