import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './SignUp.css';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
function SignUp({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // ✅ Usar AuthContext com Supabase
    const { signup } = useAuth();
    const navigate = useNavigate();
    const validateForm = () => {
        const newErrors = {};
        // Validação do nome
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Nome é obrigatório';
        }
        else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
        }
        // Validação do sobrenome
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Sobrenome é obrigatório';
        }
        else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
        }
        // Validação do email
        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        }
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        // Validação da senha
        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        }
        else if (formData.password.length < 8) {
            newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Senha deve conter letra maiúscula, minúscula e número';
        }
        // Validação da confirmação de senha
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        }
        else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }
        // Validação dos termos
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpar erro do campo quando o usuário começa a digitar
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
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        setErrors({});
        try {
            // ✅ Combinar nome e sobrenome para o campo name
            const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
            // ✅ Usar o método signup do AuthContext (Supabase)
            // O signup cria o user em auth.users e insere em nossa tabela users
            await signup(formData.email, formData.password, fullName);
            // ✅ Se signup foi bem-sucedido, redirecionar para dashboard
            // O AuthContext já atualiza o estado do usuário
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Erro no cadastro:', error);
            // ✅ Tratamento de erros do Supabase
            const errorMessage = error instanceof Error
                ? error.message
                : 'Erro ao fazer cadastro. Tente novamente.';
            setErrors({
                general: errorMessage
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const getPasswordStrength = (password) => {
        if (password.length === 0)
            return { strength: '', color: '' };
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasMinLength = password.length >= 8;
        const score = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length;
        if (score <= 1)
            return { strength: 'Fraca', color: '#e53e3e' };
        if (score <= 2)
            return { strength: 'Média', color: '#d69e2e' };
        if (score <= 3)
            return { strength: 'Boa', color: '#38a169' };
        return { strength: 'Forte', color: '#2f855a' };
    };
    const passwordStrength = getPasswordStrength(formData.password);
    return (_jsx("div", { className: "signup-container", children: _jsxs("div", { className: "signup-card", children: [_jsxs("div", { className: "signup-header", children: [_jsx("h1", { children: "Criar conta" }), _jsx("p", { children: "Preencha os dados abaixo para se cadastrar" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "signup-form", children: [errors.general && (_jsx("div", { className: "error-banner", children: _jsxs("span", { children: ["\u26A0\uFE0F ", errors.general] }) })), _jsxs("div", { className: "name-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "firstName", children: "Nome" }), _jsx("input", { type: "text", id: "firstName", name: "firstName", value: formData.firstName, onChange: handleInputChange, placeholder: "Digite seu nome", className: errors.firstName ? 'error' : '', disabled: isLoading, autoComplete: "given-name" }), errors.firstName && _jsx("span", { className: "error-message", children: errors.firstName })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "lastName", children: "Sobrenome" }), _jsx("input", { type: "text", id: "lastName", name: "lastName", value: formData.lastName, onChange: handleInputChange, placeholder: "Digite seu sobrenome", className: errors.lastName ? 'error' : '', disabled: isLoading, autoComplete: "family-name" }), errors.lastName && _jsx("span", { className: "error-message", children: errors.lastName })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleInputChange, placeholder: "Digite seu email", className: errors.email ? 'error' : '', disabled: isLoading, autoComplete: "email" }), errors.email && _jsx("span", { className: "error-message", children: errors.email })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Senha" }), _jsxs("div", { className: "password-input-container", children: [_jsx("input", { type: showPassword ? 'text' : 'password', id: "password", name: "password", value: formData.password, onChange: handleInputChange, placeholder: "Digite sua senha", className: errors.password ? 'error' : '', disabled: isLoading, autoComplete: "new-password" }), _jsx("button", { type: "button", className: "password-toggle", onClick: () => setShowPassword(!showPassword), disabled: isLoading, title: showPassword ? 'Ocultar senha' : 'Mostrar senha', children: showPassword ? '👁️' : '👁️‍🗨️' })] }), formData.password && (_jsxs("div", { className: "password-strength", children: [_jsx("span", { children: "For\u00E7a da senha: " }), _jsx("span", { style: { color: passwordStrength.color, fontWeight: 'bold' }, children: passwordStrength.strength })] })), errors.password && _jsx("span", { className: "error-message", children: errors.password })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "confirmPassword", children: "Confirmar Senha" }), _jsxs("div", { className: "password-input-container", children: [_jsx("input", { type: showConfirmPassword ? 'text' : 'password', id: "confirmPassword", name: "confirmPassword", value: formData.confirmPassword, onChange: handleInputChange, placeholder: "Confirme sua senha", className: errors.confirmPassword ? 'error' : '', disabled: isLoading, autoComplete: "new-password" }), _jsx("button", { type: "button", className: "password-toggle", onClick: () => setShowConfirmPassword(!showConfirmPassword), disabled: isLoading, title: showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha', children: showConfirmPassword ? '👁️' : '👁️‍🗨️' })] }), errors.confirmPassword && _jsx("span", { className: "error-message", children: errors.confirmPassword })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "checkbox-container", children: [_jsx("input", { type: "checkbox", name: "acceptTerms", checked: formData.acceptTerms, onChange: handleInputChange, disabled: isLoading }), _jsx("span", { className: "checkmark" }), "Eu aceito os ", _jsx("a", { href: "#", className: "terms-link", children: "termos de uso" }), " e", ' ', _jsx("a", { href: "#", className: "terms-link", children: "pol\u00EDtica de privacidade" })] }), errors.acceptTerms && _jsx("span", { className: "error-message", children: errors.acceptTerms })] }), _jsx("button", { type: "submit", className: "signup-button", disabled: isLoading, children: isLoading ? (_jsxs("span", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), "Criando conta..."] })) : ('Criar conta') })] }), _jsx("div", { className: "signup-footer", children: _jsxs("p", { children: ["J\u00E1 tem uma conta?", ' ', _jsx("button", { type: "button", className: "switch-to-login", onClick: onSwitchToLogin, disabled: isLoading, children: "Fa\u00E7a login" })] }) })] }) }));
}
export default SignUp;
