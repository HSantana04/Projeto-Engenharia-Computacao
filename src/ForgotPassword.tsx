import { useState } from 'react';
import './ForgotPassword.css';

interface ForgotPasswordFormData {
    email: string;
}

interface ForgotPasswordFormErrors {
    email?: string;
}

interface ForgotPasswordProps {
    onSwitchToLogin: () => void;
}

function ForgotPassword({ onSwitchToLogin }: ForgotPasswordProps) {
    const [formData, setFormData] = useState<ForgotPasswordFormData>({
        email: ''
    });

    const [errors, setErrors] = useState<ForgotPasswordFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    // Função para verificar se o email é válido
    const isEmailValid = (email: string): boolean => {
        return email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
    };

    // Verificar se o formulário pode ser enviado
    const canSubmit = isEmailValid(formData.email) && !isLoading;

    const validateForm = (): boolean => {
        const newErrors: ForgotPasswordFormErrors = {};

        // Validação de email
        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpar erro do campo quando o usuário começa a digitar
        if (errors[name as keyof ForgotPasswordFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
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

        } catch (error) {
            console.error('Erro ao enviar email de recuperação:', error);
            alert('Erro ao enviar email de recuperação. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendEmail = () => {
        setIsEmailSent(false);
        setFormData({ email: '' });
    };

    if (isEmailSent) {
        return (
            <div className="forgot-password-container">
                <div className="forgot-password-card">
                    <div className="success-icon">✅</div>
                    <div className="forgot-password-header">
                        <h1>Email enviado!</h1>
                        <p>Verifique sua caixa de entrada</p>
                    </div>
                    
                    <div className="email-sent-message">
                        <p>
                            Enviamos um link de recuperação para <strong>{formData.email}</strong>
                        </p>
                        <p>
                            Clique no link enviado para redefinir sua senha. O link expira em 1 hora.
                        </p>
                    </div>

                    <div className="action-buttons">
                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResendEmail}
                        >
                            Reenviar email
                        </button>
                        
                        <button
                            type="button"
                            className="back-to-login-button"
                            onClick={onSwitchToLogin}
                        >
                            Voltar ao login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="forgot-password-header">
                    <h1>Esqueceu sua senha?</h1>
                    <p>Digite seu email para receber um link de recuperação</p>
                </div>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Digite seu email"
                            className={errors.email ? 'error' : ''}
                            disabled={isLoading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <button
                        type="submit"
                        className="send-reset-button"
                        disabled={!canSubmit}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">
                                <div className="spinner"></div>
                                Enviando...
                            </span>
                        ) : (
                            'Enviar link de recuperação'
                        )}
                    </button>
                </form>

                <div className="forgot-password-footer">
                    <p>
                        Lembrou sua senha?{' '}
                        <button
                            type="button"
                            className="back-to-login-link"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Voltar ao login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
