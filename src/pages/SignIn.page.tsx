import '@firebase-oss/ui-styles/dist.min.css';
import { SignInAuthScreen } from '@firebase-oss/ui-react';
import { Box, GlobalStyles } from '@mui/material';
import { firebaseUiVars } from 'src/assets/themes/firebaseUi.theme';

const SignIn = () => {
  const onSignInClick = () => {};
  return (
    <>
      {/* Must be :root — FirebaseUI resolves --fui-* into --color-* on :root itself, so
          scoping these to a wrapper would have no effect. */}
      <GlobalStyles styles={{ ':root': firebaseUiVars }} />
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SignInAuthScreen onSignIn={onSignInClick} />
      </Box>
    </>
  );
};

export default SignIn;
