import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import './Login.css';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from './config/supabaseClient';
import userService from './services/userService';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

interface LoginFormErrors {
    email?: string;
    password?: string;
    general?: string;
}

interface LoginProps {
    onSwitchToSignUp: () => void;
    onSwitchToForgotPassword: () => void;
}

function Login({ onSwitchToSignUp, onSwitchToForgotPassword }: LoginProps) {
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState<LoginFormErrors>({});
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

    const validateForm = (): boolean => {
        const newErrors: LoginFormErrors = {};

        if (!formData.email) newErrors.email = 'Email é obrigatório';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

        if (!formData.password) newErrors.password = 'Senha é obrigatória';
        else if (formData.password.length < 6)
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name as keyof LoginFormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
                general: undefined
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // 1️⃣ Login no auth.users
            const result = await login(formData.email, formData.password);

            if (!result) {
                throw new Error('Falha no login');
            }

            // 2️⃣ Busca o user na tabela public.users
            // 2️⃣ Pega o usuário logado do Supabase
const {
    data: { user }
} = await supabase.auth.getUser();

if (!user?.id) {
    throw new Error('Falha ao obter usuário autenticado');
}

// 3️⃣ Busca o usuário na tabela public.users pelo auth_id
const userDb = await userService.getCurrentUser(user.id);

if (!userDb) {
    throw new Error('Usuário não encontrado na tabela users');
}

            if (!userDb) {
                throw new Error('Usuário não encontrado na tabela users');
            }

            // 3️⃣ Redirect AQUI MESMO 🔥
            navigate('/dashboard');

        } catch (error: any) {
            console.error('Erro no login:', error);

            setErrors({
                general: error.message || 'Email ou senha inválidos.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Bem-vindo de volta</h1>
                    <p>Faça login na sua conta para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">

                    {errors.general && (
                        <div className="error-banner">
                            <span>⚠️ {errors.general}</span>
                        </div>
                    )}

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
                            autoComplete="email"
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
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
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-options">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                            <span className="checkmark"></span>
                            Lembrar-me
                        </label>

                        <button
                            type="button"
                            className="forgot-password"
                            onClick={onSwitchToForgotPassword}
                            disabled={isLoading}
                        >
                            Esqueci minha senha
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading-spinner">
                                <div className="spinner"></div>
                                Entrando...
                            </span>
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Não tem uma conta?{' '}
                        <button
                            type="button"
                            className="switch-to-signup"
                            onClick={onSwitchToSignUp}
                            disabled={isLoading}
                        >
                            Cadastre-se
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
