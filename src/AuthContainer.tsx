import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import './AuthContainer.css';

type AuthMode = 'login' | 'signup' | 'forgot-password';

function AuthContainer() {
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const switchToSignUp = () => {
        setAuthMode('signup');
    };

    const switchToLogin = () => {
        setAuthMode('login');
    };

    const switchToForgotPassword = () => {
        setAuthMode('forgot-password');
    };

    return (
        <div className="auth-container">
            {authMode === 'login' ? (
                <Login 
                    onSwitchToSignUp={switchToSignUp} 
                    onSwitchToForgotPassword={switchToForgotPassword}
                />
            ) : authMode === 'signup' ? (
                <SignUp onSwitchToLogin={switchToLogin} />
            ) : (
                <ForgotPassword onSwitchToLogin={switchToLogin} />
            )}
        </div>
    );
}

export default AuthContainer;