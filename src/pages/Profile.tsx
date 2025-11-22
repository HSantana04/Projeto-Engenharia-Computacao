import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { user: authUser, logout } = useAuth();

  // ========== ESTADOS DE PERFIL ==========
  const [profile, setProfile] = useState(authUser);
  const [formData, setFormData] = useState<FormData>({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    bio: authUser?.bio || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ========== ESTADOS DE SENHA ==========
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // ========== CARREGAR PERFIL ==========
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data } = await api.get('/Users/me');
        setProfile(data);

        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || ''
        });

        console.log('✅ Perfil carregado:', data);
      } catch (err: any) {
        console.error('❌ Erro ao carregar perfil:', err);
        setError(err.response?.data?.message || 'Erro ao carregar perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ========== LIMPAR MENSAGENS ==========
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ========== HANDLE CHANGE DO FORMULÁRIO ==========
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  // ========== HANDLE CHANGE DO FORMULÁRIO DE SENHA ==========
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // ========== VALIDAR FORMULÁRIO DE PERFIL ==========
  const validateProfileForm = (): boolean => {
    if (!formData.firstName.trim()) {
      alert('Nome é obrigatório');
      return false;
    }
    if (!formData.lastName.trim()) {
      alert('Sobrenome é obrigatório');
      return false;
    }
    return true;
  };

  // ========== VALIDAR FORMULÁRIO DE SENHA ==========
  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.oldPassword) {
      errors.oldPassword = 'Senha atual é obrigatória';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Senha deve conter maiúscula, minúscula e número';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========== SUBMIT FORMULÁRIO DE PERFIL ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await api.put('/Users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio
      });

      setProfile(data);
      setSuccessMessage('✅ Perfil atualizado com sucesso!');
      setHasChanges(false);

      console.log('✅ Perfil atualizado:', data);
    } catch (err: any) {
      console.error('❌ Erro ao atualizar perfil:', err);

      if (err.response?.status === 401) {
        setError('Sua sessão expirou. Faça login novamente.');
        logout();
      } else {
        setError(err.response?.data?.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ========== SUBMIT FORMULÁRIO DE SENHA ==========
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.post('/Users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      setSuccessMessage('✅ Senha alterada com sucesso!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setPasswordErrors({});

      console.log('✅ Senha alterada');
    } catch (err: any) {
      console.error('❌ Erro ao alterar senha:', err);

      if (err.response?.status === 401) {
        setPasswordErrors({ oldPassword: 'Senha atual incorreta' });
      } else {
        setError(err.response?.data?.message || 'Erro ao alterar senha');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ========== CANCELAR EDIÇÃO ==========
  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || ''
      });
      setHasChanges(false);
    }
  };

  // ========== CANCELAR ALTERAÇÃO DE SENHA ==========
  const handleCancelPassword = () => {
    setShowPasswordForm(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  };

  // ========== RENDER LOADING ==========
  if (isLoading) {
    return (
      <div className="profile__loading">
        <div className="profile__loading-spinner"></div>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  const currentUser = profile || authUser;

  return (
    <div className="profile">
      <div className="profile__container">
        {/* ========== HEADER ========== */}
        <header className="profile__header">
          <div>
            <Link to="/dashboard" className="back-link">
              ← Voltar ao Dashboard
            </Link>
            <h1 className="profile__title">Meu Perfil</h1>
            <p className="profile__subtitle">Gerencie suas informações pessoais</p>
          </div>
        </header>

        {/* ========== MENSAGENS ========== */}
        {error && (
          <div className="profile__alert profile__alert--error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {successMessage && (
          <div className="profile__alert profile__alert--success">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)}>✕</button>
          </div>
        )}

        {/* ========== CARD DE PERFIL ========== */}
        <div className="profile__card">
          {/* Avatar */}
          <div className="profile__avatar">
            <div className="profile__avatar-img">
              {currentUser?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="profile__avatar-name">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <p className="profile__avatar-email">{currentUser?.email}</p>
          </div>

          {/* ========== FORMULÁRIO DE PERFIL ========== */}
          <form onSubmit={handleSubmit} className="profile__form">
            <h2 className="profile__section-title">Informações Pessoais</h2>

            <div className="profile__field-row">
              <div className="profile__field">
                <label className="profile__label">
                  <span className="profile__label-icon">👤</span>
                  Nome
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="profile__input"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="profile__field">
                <label className="profile__label">
                  <span className="profile__label-icon">👤</span>
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="profile__input"
                  placeholder="Digite seu sobrenome"
                  required
                />
              </div>
            </div>

            <div className="profile__field">
              <label className="profile__label">
                <span className="profile__label-icon">📧</span>
                Email
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                className="profile__input profile__input--disabled"
                placeholder="Email"
                disabled
              />
              <small className="profile__hint">Email não pode ser alterado</small>
            </div>

            <div className="profile__field">
              <label className="profile__label">
                <span className="profile__label-icon">📝</span>
                Biografia
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="profile__input profile__textarea"
                placeholder="Conte um pouco sobre você..."
                rows={4}
              />
              <small className="profile__hint">{formData.bio.length}/500 caracteres</small>
            </div>

            <div className="profile__actions">
              <button
                type="button"
                onClick={handleCancel}
                className="profile__btn profile__btn--secondary"
                disabled={isSaving || !hasChanges}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="profile__btn profile__btn--primary"
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? '⏳ Salvando...' : '💾 Salvar alterações'}
              </button>
            </div>
          </form>
        </div>

        {/* ========== CARD DE SEGURANÇA ========== */}
        <div className="profile__card">
          <h2 className="profile__section-title">🔒 Segurança</h2>

          {!showPasswordForm ? (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="profile__btn profile__btn--secondary"
            >
              🔑 Alterar Senha
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="profile__form">
              <div className="profile__field">
                <label className="profile__label">Senha Atual</label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className="profile__input"
                  placeholder="Digite sua senha atual"
                />
                {passwordErrors.oldPassword && (
                  <small className="profile__error">{passwordErrors.oldPassword}</small>
                )}
              </div>

              <div className="profile__field">
                <label className="profile__label">Nova Senha</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="profile__input"
                  placeholder="Digite sua nova senha"
                />
                {passwordErrors.newPassword && (
                  <small className="profile__error">{passwordErrors.newPassword}</small>
                )}
              </div>

              <div className="profile__field">
                <label className="profile__label">Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="profile__input"
                  placeholder="Confirme sua nova senha"
                />
                {passwordErrors.confirmPassword && (
                  <small className="profile__error">{passwordErrors.confirmPassword}</small>
                )}
              </div>

              <div className="profile__actions">
                <button
                  type="button"
                  onClick={handleCancelPassword}
                  className="profile__btn profile__btn--secondary"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="profile__btn profile__btn--primary"
                  disabled={isSaving}
                >
                  {isSaving ? '⏳ Alterando...' : '✅ Alterar Senha'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ========== CARD DE INFORMAÇÕES ========== */}
        <div className="profile__card profile__card--info">
          <h2 className="profile__section-title">ℹ️ Informações da Conta</h2>

          <div className="profile__info-grid">
            <div className="profile__info-item">
              <span className="profile__info-label">Membro desde:</span>
              <span className="profile__info-value">
                {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>

            <div className="profile__info-item">
              <span className="profile__info-label">Última atualização:</span>
              <span className="profile__info-value">
                {currentUser?.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
              </span>
            </div>

            <div className="profile__info-item">
              <span className="profile__info-label">Status:</span>
              <span className="profile__info-value">
                {currentUser?.isActive ? '🟢 Ativo' : '🔴 Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;