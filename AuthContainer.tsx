import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import './AuthContainer.css';

type AuthMode = 'login' | 'signup';

function AuthContainer() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const switchToSignUp = () => {
    setAuthMode('signup');
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="auth-container">
      {authMode === 'login' ? (
        <Login onSwitchToSignUp={switchToSignUp} />
      ) : (
        <SignUp onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
}

export default AuthContainer;
