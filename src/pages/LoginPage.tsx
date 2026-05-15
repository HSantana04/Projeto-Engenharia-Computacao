import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import logoUrl from '../assets/Logoportfelofc.png';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique a caixa de entrada.';
  }
  if (lower.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde um momento e tente novamente.';
  }
  return message;
}

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(mapAuthError(signInError.message));
        return;
      }

      if (!data.session) {
        setError('Não foi possível iniciar a sessão. Verifique se o e-mail foi confirmado.');
        return;
      }

      const uid = data.session.user.id;
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id')
        .eq('id', uid)
        .maybeSingle();

      if (clientRow) {
        navigate('/client-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col lg:flex-row">
      {/* Left Side - Hero (Dark Canvas) */}
      <div className="hidden lg:flex lg:w-1/2 bg-canvas-dark text-on-dark flex-col justify-between p-xl">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-body-md text-on-dark-mute hover:text-on-dark transition-colors w-fit"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Link>

        {/* Hero Content */}
        <div className="space-y-xl">
          <div>
            <h1 className="text-display-xl font-display text-on-dark mb-lg">
              Gerencie seu portfólio com confiança
            </h1>
            <p className="text-body-lg text-on-dark-mute max-w-md">
              Plataforma moderna de consultoria financeira para profissionais e clientes.
            </p>
          </div>

          <div className="space-y-md">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="h-6 w-6 rounded bg-primary" />
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-dark">Análise em Tempo Real</p>
                <p className="text-body-sm text-on-dark-mute">Acompanhe seu portfólio instantaneamente</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="h-6 w-6 rounded bg-primary" />
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-dark">Segurança em Primeiro Lugar</p>
                <p className="text-body-sm text-on-dark-mute">Seus dados protegidos com criptografia</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <div className="h-6 w-6 rounded bg-primary" />
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-dark">Consultoria Integrada</p>
                <p className="text-body-sm text-on-dark-mute">Acesso a ferramentas profissionais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-caption text-on-dark-mute">
          © 2026 FinansmartAI. Todos os direitos reservados.
        </p>
      </div>

      {/* Right Side - Login Form (Light Canvas) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-0 lg:px-8">
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-body-md text-ink hover:text-ink/70 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-section">
            <div className="inline-flex items-center gap-3 mb-md">
              <img src={logoUrl} alt="FinansmartAI" className="h-10 w-auto" />
              <span className="text-heading-lg font-display font-semibold text-ink">FinansmartAI</span>
            </div>
            <p className="text-body-md text-stone">Acesse sua conta para continuar</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-card rounded-lg border border-hairline-light p-xxl space-y-lg">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-accent-danger/10 border border-accent-danger/30 px-4 py-3 text-body-sm text-accent-danger">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-lg">
              {/* Email Field */}
              <div>
                <label htmlFor="login-email" className="block text-body-sm font-semibold text-ink mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="text-input pl-12"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-body-sm font-semibold text-ink">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-body-sm font-semibold text-primary hover:text-primary-bright transition-colors"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !email || !password}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-canvas-dark/20 border-t-canvas-dark rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-hairline-light" />
              <span className="text-caption text-stone">ou</span>
              <div className="flex-1 border-t border-hairline-light" />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-body-md text-ink">
              Não tem uma conta?{' '}
              <Link to="/create-account" className="font-semibold text-primary hover:text-primary-bright transition-colors">
                Criar conta
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <p className="mt-section text-center text-caption text-stone">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};
