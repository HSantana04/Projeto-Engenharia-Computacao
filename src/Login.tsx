import { useState, type ChangeEvent, type FormEvent } from 'react';
import './Login.css';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: localStorage.getItem('rememberedEmail') || '',
    password: '',
    rememberMe: !!localStorage.getItem('rememberedEmail')
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
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

    if (errors[name as keyof LoginFormErrors]) {
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
      // ========== CHAMAR LOGIN DO CONTEXTO ==========
      await login(formData.email, formData.password);

      // Salvar email se "Lembrar de mim"
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setSuccessMessage('✅ Login realizado com sucesso!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      if (error.response?.status === 401) {
        setErrors({ general: 'Email ou senha inválidos' });
      } else if (error.response?.status === 400) {
        setErrors({ general: error.response.data?.message || 'Dados inválidos' });
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Erro no servidor. Tente novamente mais tarde.' });
      } else if (error.message === 'Network Error') {
        setErrors({ general: 'Erro de conexão. Verifique se o servidor está rodando.' });
      } else {
        setErrors({ general: error.response?.data?.message || 'Erro desconhecido' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onSwitchToForgotPassword();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Bem-vindo de volta</h1>
          <p>Faça login na sua conta para continuar</p>
        </div>

        {successMessage && (
          <div className="success-banner">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="error-banner">
            <span>⚠️ {errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
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
            {errors.password && <span className="error-message">{errors.password}</span>}
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
              onClick={handleForgotPassword}
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