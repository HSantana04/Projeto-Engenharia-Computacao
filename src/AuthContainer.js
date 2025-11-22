import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import './AuthContainer.css';
function AuthContainer() {
    const [authMode, setAuthMode] = useState('login');
    const switchToSignUp = () => {
        setAuthMode('signup');
    };
    const switchToLogin = () => {
        setAuthMode('login');
    };
    const switchToForgotPassword = () => {
        setAuthMode('forgot-password');
    };
    return (_jsx("div", { className: "auth-container", children: authMode === 'login' ? (_jsx(Login, { onSwitchToSignUp: switchToSignUp, onSwitchToForgotPassword: switchToForgotPassword })) : authMode === 'signup' ? (_jsx(SignUp, { onSwitchToLogin: switchToLogin })) : (_jsx(ForgotPassword, { onSwitchToLogin: switchToLogin })) }));
}
export default AuthContainer;
