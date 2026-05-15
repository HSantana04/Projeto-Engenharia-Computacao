import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import logoUrl from '../assets/Logoportfelofc.png';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

type AccountType = 'consultor' | 'cliente';

function onlyDigits(input: string) {
  return input.replace(/\D/g, '').slice(0, 11);
}

function formatCpfForTyping(input: string) {
  const digits = onlyDigits(input);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export const CreateAccountPage = () => {
  const [accountType, setAccountType] = useState<AccountType>('consultor');
  const [classification, setClassification] = useState<'gestao_financeira' | 'escola'>('gestao_financeira');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfConsultor, setCpfConsultor] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const cpfDigits = useMemo(() => onlyDigits(cpf), [cpf]);
  const cpfConsultorDigits = useMemo(() => onlyDigits(cpfConsultor), [cpfConsultor]);

  const validateCpf = (value: string) => value.length === 11;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !cpfDigits || !password || !confirmPassword) return;
    if (!validateCpf(cpfDigits)) return setError('CPF do usuário deve conter 11 dígitos.');
    if (password !== confirmPassword) return setError('As senhas não conferem.');

    if (accountType === 'cliente') {
      if (!cpfConsultorDigits) return setError('Informe o CPF do consultor conectado.');
      if (!validateCpf(cpfConsultorDigits)) return setError('CPF do consultor deve conter 11 dígitos.');

      const { data: consultorRow, error: consultorLookupError } = await supabase
        .from('consultores')
        .select('cpf')
        .eq('cpf', cpfConsultorDigits)
        .maybeSingle();

      if (consultorLookupError) {
        setError(consultorLookupError.message);
        return;
      }

      if (!consultorRow) {
        setError('Consultor não encontrado para o CPF informado.');
        return;
      }
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setError('Este e-mail já possui um registro de login. Faça login ou exclua no painel de Autenticação.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setError('Não foi possível obter o usuário criado.');
        return;
      }

      if (accountType === 'consultor') {
        const { error: insertError } = await supabase.from('consultores').insert({
          auth_user_id: userId,
          cpf: cpfDigits,
          name,
          email,
        });

        if (insertError) {
          if (insertError.message.includes('unique') || insertError.code === '23505') {
            setError('Este CPF já está cadastrado.');
          } else {
            setError(`Erro ao criar perfil: ${insertError.message}`);
          }
          return;
        }
      } else {
        const { error: insertError } = await supabase.from('clients').insert({
          id: userId,
          name,
          email,
          cpf: cpfDigits,
          cpf_consultor: cpfConsultorDigits,
          classification,
        });

        if (insertError) {
          if (insertError.message.includes('unique') || insertError.code === '23505') {
            setError('Este CPF já está cadastrado em outro cliente.');
          } else {
            setError(`Erro ao criar perfil: ${insertError.message}`);
          }
          return;
        }
      }

      navigate(accountType === 'cliente' ? '/client-dashboard' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col">
      {/* Back Button */}
      <div className="p-6 flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-body-md text-ink hover:text-ink/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Link>
      </div>

      {/* Sign Up Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-section">
            <div className="inline-flex items-center gap-3 mb-md">
              <img src={logoUrl} alt="FinansmartAI" className="h-10 w-auto" />
              <span className="text-heading-lg font-display font-semibold text-ink">FinansmartAI</span>
            </div>
            <p className="text-body-md text-stone">Crie sua conta para continuar</p>
          </div>

          {/* Sign Up Card */}
          <div className="bg-surface-card rounded-lg border border-hairline-light p-xxl space-y-lg">
            <form onSubmit={handleSignUp} className="space-y-lg">
              {/* Account Type Selection */}
              <div>
                <label className="block text-body-sm font-semibold text-ink mb-3">Tipo de conta</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('consultor')}
                    className={`px-4 py-3 rounded-md text-body-md font-semibold transition-all border ${
                      accountType === 'consultor'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-soft text-ink border-hairline-light hover:bg-hairline-light'
                    }`}
                  >
                    Consultor
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('cliente')}
                    className={`px-4 py-3 rounded-md text-body-md font-semibold transition-all border ${
                      accountType === 'cliente'
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-surface-soft text-ink border-hairline-light hover:bg-hairline-light'
                    }`}
                  >
                    Cliente
                  </button>
                </div>
              </div>

              {/* Classification (for Cliente only) */}
              {accountType === 'cliente' && (
                <div>
                  <label className="block text-body-sm font-semibold text-ink mb-3">Classificação</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setClassification('gestao_financeira')}
                      className={`px-4 py-3 rounded-md text-body-sm font-semibold transition-all border ${
                        classification === 'gestao_financeira'
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-soft text-ink border-hairline-light hover:bg-hairline-light'
                      }`}
                    >
                      Gestão Financeira
                    </button>
                    <button
                      type="button"
                      onClick={() => setClassification('escola')}
                      className={`px-4 py-3 rounded-md text-body-sm font-semibold transition-all border ${
                        classification === 'escola'
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-soft text-ink border-hairline-light hover:bg-hairline-light'
                      }`}
                    >
                      Escola
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-accent-danger/10 border border-accent-danger/30 px-4 py-3 text-body-sm text-accent-danger">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="signup-name" className="block text-body-sm font-semibold text-ink mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="text-input pl-12"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="signup-email" className="block text-body-sm font-semibold text-ink mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="text-input pl-12"
                    required
                  />
                </div>
              </div>

              {/* CPF Field */}
              <div>
                <label htmlFor="signup-cpf" className="block text-body-sm font-semibold text-ink mb-2">
                  CPF
                </label>
                <input
                  id="signup-cpf"
                  type="text"
                  inputMode="numeric"
                  value={formatCpfForTyping(cpf)}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="text-input"
                  required
                  maxLength={14}
                />
              </div>

              {/* CPF of Consultant (for Cliente only) */}
              {accountType === 'cliente' && (
                <div>
                  <label htmlFor="signup-cpf-consultor" className="block text-body-sm font-semibold text-ink mb-2">
                    CPF do Consultor
                  </label>
                  <input
                    id="signup-cpf-consultor"
                    type="text"
                    inputMode="numeric"
                    value={formatCpfForTyping(cpfConsultor)}
                    onChange={(e) => setCpfConsultor(e.target.value)}
                    placeholder="000.000.000-00"
                    className="text-input"
                    required
                    maxLength={14}
                  />
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="signup-password" className="block text-body-sm font-semibold text-ink mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="signup-password"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-body-sm font-semibold text-ink mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="text-input pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !name || !email || !cpfDigits || !password || !confirmPassword}
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-12 mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-canvas-dark/20 border-t-canvas-dark rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-hairline-light" />
              <span className="text-caption text-stone">ou</span>
              <div className="flex-1 border-t border-hairline-light" />
            </div>

            {/* Sign In Link */}
            <p className="text-center text-body-md text-ink">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-bright transition-colors">
                Entrar
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-section text-center text-caption text-stone">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </div>
      </div>
    </div>
  );
};
