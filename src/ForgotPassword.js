import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './ForgotPassword.css';
function ForgotPassword({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    // Função para verificar se o email é válido
    const isEmailValid = (email) => {
        return email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
    };
    // Verificar se o formulário pode ser enviado
    const canSubmit = isEmailValid(formData.email) && !isLoading;
    const validateForm = () => {
        const newErrors = {};
        // Validação de email
        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        }
        else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpar erro do campo quando o usuário começa a digitar
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            // Simular chamada de API para envio de email de recuperação
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Aqui você implementaria a lógica real de envio de email
            console.log('Email de recuperação enviado para:', formData.email);
            // Mostrar mensagem de sucesso
            setIsEmailSent(true);
        }
        catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
            alert('Erro ao enviar email de recuperação. Tente novamente.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleResendEmail = () => {
        setIsEmailSent(false);
        setFormData({ email: '' });
    };
    if (isEmailSent) {
        return (_jsx("div", { className: "forgot-password-container", children: _jsxs("div", { className: "forgot-password-card", children: [_jsx("div", { className: "success-icon", children: "\u2705" }), _jsxs("div", { className: "forgot-password-header", children: [_jsx("h1", { children: "Email enviado!" }), _jsx("p", { children: "Verifique sua caixa de entrada" })] }), _jsxs("div", { className: "email-sent-message", children: [_jsxs("p", { children: ["Enviamos um link de recupera\u00E7\u00E3o para ", _jsx("strong", { children: formData.email })] }), _jsx("p", { children: "Clique no link enviado para redefinir sua senha. O link expira em 1 hora." })] }), _jsxs("div", { className: "action-buttons", children: [_jsx("button", { type: "button", className: "resend-button", onClick: handleResendEmail, children: "Reenviar email" }), _jsx("button", { type: "button", className: "back-to-login-button", onClick: onSwitchToLogin, children: "Voltar ao login" })] })] }) }));
    }
    return (_jsx("div", { className: "forgot-password-container", children: _jsxs("div", { className: "forgot-password-card", children: [_jsxs("div", { className: "forgot-password-header", children: [_jsx("h1", { children: "Esqueceu sua senha?" }), _jsx("p", { children: "Digite seu email para receber um link de recupera\u00E7\u00E3o" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "forgot-password-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleInputChange, placeholder: "Digite seu email", className: errors.email ? 'error' : '', disabled: isLoading }), errors.email && _jsx("span", { className: "error-message", children: errors.email })] }), _jsx("button", { type: "submit", className: "send-reset-button", disabled: !canSubmit, children: isLoading ? (_jsxs("span", { className: "loading-spinner", children: [_jsx("div", { className: "spinner" }), "Enviando..."] })) : ('Enviar link de recuperação') })] }), _jsx("div", { className: "forgot-password-footer", children: _jsxs("p", { children: ["Lembrou sua senha?", ' ', _jsx("button", { type: "button", className: "back-to-login-link", onClick: onSwitchToLogin, disabled: isLoading, children: "Voltar ao login" })] }) })] }) }));
}
export default ForgotPassword;
