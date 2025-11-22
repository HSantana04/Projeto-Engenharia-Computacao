import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import './Login.css';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient';
function Login({ onSwitchToSignUp, onSwitchToForgotPassword }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    // 🔥 Se já tiver sessão, já redireciona (protege rota /login)
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) {
                navigate('/dashboard');
            }
        });
    }, []);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email)
            newErrors.email = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'Email inválido';
        if (!formData.password)
            newErrors.password = 'Senha é obrigatória';
        else if (formData.password.length < 6)
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
                general: undefined
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setIsLoading(true);
        setErrors({});
        try {
            const loginSuccess = await login(formData.email, formData.password);
            if (!loginSuccess) {
                throw new Error('Falha no login');
            }
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Erro no login:', error);
            setErrors({
                general: error.message || 'Email ou senha inválidos.'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "login-container", children: _jsxs("div", { className: "login-card", children: [_jsxs("div", { className: "login-header", children: [_jsx("h1", { children: "Bem-vindo de volta" }), _jsx("p", { children: "Fa\u00E7a login na sua conta para continuar" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [errors.general && (_jsx("div", { className: "error-banner", children: _jsxs("span", { children: ["\u26A0\uFE0F ", errors.general] }) })), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleInputChange, placeholder: "Digite seu email", className: errors.email ? 'error' : '', disabled: isLoading, autoComplete: "email" }), errors.email && (_jsx("span", { className: "error-message", children: errors.email }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Senha" }), _jsxs("div", { className: "password-input-container", children: [_jsx("input", { type: showPassword ? 'text' : 'password', id: "password", name: "password", value: formData.password, onChange: handleInputChange, placeholder: "Digite sua senha", className: errors.password ? 'error' : '', disabled: isLoading, autoComplete: "current-password" }), _jsx("button", { type: "button", className: "password-toggle", onClick: () => setShowPassword(!showPassword), disabled: isLoading, title: showPassword ? 'Ocultar senha' : 'Mostrar senha', children: showPassword ? '👁️' : '👁️‍🗨️' })] }), errors.password && (_jsx("span", { className: "error-message", children: errors.password }))] }), _jsxs("div", { className: "form-options", children: [_jsxs("label", { className: "checkbox-container", children: [_jsx("input", { type: "checkbox", name: "rememberMe", checked: formData.rememberMe, onChange: handleInputChange, disabled: isLoading }), _jsx("span", { className: "checkmark" }), "Lembrar-me"] }), _jsx("button", { type: "button", className: "forgot-password", onClick: onSwitchToForgotPassword, disabled: isLoading, children: "Esqueci minha senha" })] }), _jsx("button", { type: "submit", className: "login-button", disabled: isLoading, children: isLoading ? (_jsxs("span", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), "Entrando..."] })) : ('Entrar') })] }), _jsx("div", { className: "login-footer", children: _jsxs("p", { children: ["N\u00E3o tem uma conta?", ' ', _jsx("button", { type: "button", className: "switch-to-signup", onClick: onSwitchToSignUp, disabled: isLoading, children: "Cadastre-se" })] }) })] }) }));
}
export default Login;
