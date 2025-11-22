import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

interface SignUpFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

interface SignUpFormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
    general?: string;
}

interface SignUpProps {
    onSwitchToLogin: () => void;
}

function SignUp({ onSwitchToLogin }: SignUpProps) {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<SignUpFormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
    });

    const [errors, setErrors] = useState<SignUpFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const validateForm = (): boolean => {
        const newErrors: SignUpFormErrors = {};

        // Validação do nome
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Nome é obrigatório';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'Nome deve ter pelo menos 2 caracteres';
        }

        // Validação do sobrenome
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Sobrenome é obrigatório';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Sobrenome deve ter pelo menos 2 caracteres';
        }

        // Validação do email
        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        // Validação da senha
        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Senha deve conter letra maiúscula, minúscula e número';
        }

        // Validação da confirmação de senha
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirme sua senha';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        // Validação dos termos
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Você deve aceitar os termos de uso';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpar erro do campo quando o usuário começa a digitar
        if (errors[name as keyof SignUpFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setSuccessMessage(null);

        try {
            // ========== CHAMAR API DE REGISTRO ==========
            const response = await fetch('http://localhost:5217/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                })
            });

            // ========== TRATAMENTO DE ERROS ==========
            if (!response.ok) {
                const errorData = await response.json();
                
                // Verificar se é erro de email já existente
                if (response.status === 400) {
                    setErrors({
                        general: errorData.message || 'Email já existe ou dados inválidos'
                    });
                } else if (response.status === 500) {
                    setErrors({
                        general: 'Erro no servidor. Tente novamente mais tarde.'
                    });
                } else {
                    setErrors({
                        general: errorData.message || 'Erro ao criar conta'
                    });
                }
                return;
            }

            // ========== SUCESSO! ==========
            const data = await response.json();

            // Salvar tokens no localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            setSuccessMessage('✅ Cadastro realizado com sucesso!');

            // Redirecionar para Dashboard após 1.5 segundos
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Erro no cadastro:', error);
            setErrors({
                general: error instanceof Error ? error.message : 'Erro desconhecido ao tentar se cadastrar'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = (password: string): { strength: string; color: string } => {
        if (password.length === 0) return { strength: '', color: '' };

        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasMinLength = password.length >= 8;

        const score = [hasLower, hasUpper, hasNumber, hasMinLength].filter(Boolean).length;

        if (score <= 1) return { strength: 'Fraca', color: '#e53e3e' };
        if (score <= 2) return { strength: 'Média', color: '#d69e2e' };
        if (score <= 3) return { strength: 'Boa', color: '#38a169' };
        return { strength: 'Forte', color: '#2f855a' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Criar conta</h1>
                    <p>Preencha os dados abaixo para se cadastrar</p>
                </div>

                {/* Mensagem de Sucesso */}
                {successMessage && (
                    <div className="success-banner">
                        {successMessage}
                    </div>
                )}

                {/* Mensagem de Erro Geral */}
                {errors.general && (
                    <div className="error-banner">
                        <span>⚠️ {errors.general}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="name-row">
                        <div className="form-group">
                            <label htmlFor="firstName">Nome</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Digite seu nome"
                                className={errors.firstName ? 'error' : ''}
                                disabled={isLoading}
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">Sobrenome</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Digite seu sobrenome"
                                className={errors.lastName ? 'error' : ''}
                                disabled={isLoading}
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Digite sua senha"
                                className={errors.password ? 'error' : ''}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="password-strength">
                                <span>Força da senha: </span>
                                <span style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                                    {passwordStrength.strength}
                                </span>
                            </div>
                        )}
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirme sua senha"
                                className={errors.confirmPassword ? 'error' : ''}
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                    </div>

                    <div className="form-group">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <span className="checkmark"></span>
                            Eu aceito os <a href="#" className="terms-link">termos de uso</a> e{' '}
                            <a href="#" className="terms-link">política de privacidade</a>
                        </label>
                        {errors.acceptTerms && <span className="error-message">{errors.acceptTerms}</span>}
                    </div>

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">
                                <div className="spinner"></div>
                                Criando conta...
                            </span>
                        ) : (
                            'Criar conta'
                        )}
                    </button>
                </form>

                <div className="signup-footer">
                    <p>
                        Já tem uma conta?{' '}
                        <button
                            type="button"
                            className="switch-to-login"
                            onClick={onSwitchToLogin}
                            disabled={isLoading}
                        >
                            Faça login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;