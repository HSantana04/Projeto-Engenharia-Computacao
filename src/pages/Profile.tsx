import React, { useState, useEffect } from 'react';
import './Profile.css';

interface UserProfile {
    name: string;
    email: string;
    bio?: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile>({
        name: "João Silva",
        email: "joao.silva@email.com",
        bio: "Desenvolvedor apaixonado por tecnologia e finanças.",
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Simulação de API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Aqui você faria a chamada real para sua API
            // const response = await fetch("/api/user/update", {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(user)
            // });
            
            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Falha ao atualizar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setUser({
            name: "João Silva",
            email: "joao.silva@email.com",
            bio: "Desenvolvedor apaixonado por tecnologia e finanças.",
        });
    };

    if (loading) {
        return (
            <div className="profile__loading">
                <div className="profile__loading-spinner"></div>
                Carregando perfil...
            </div>
        );
    }

    return (
        <div className="profile">
            <div className="profile__container">
                <div className="profile__header">
                    <h1 className="profile__title">Meu Perfil</h1>
                    <p className="profile__subtitle">Gerencie suas informações pessoais</p>
                </div>
                
                <div className="profile__card">
                    <div className="profile__avatar">
                        <div className="profile__avatar-img">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <label className="profile__avatar-upload">
                            <input type="file" accept="image/*" />
                            📷 Alterar foto
                        </label>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="profile__form">
                        <div className="profile__field">
                            <label className="profile__label">
                                <span className="profile__label-icon">👤</span>
                                Nome completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={user.name}
                                onChange={handleChange}
                                className="profile__input"
                                placeholder="Digite seu nome completo"
                                required
                            />
                        </div>
                        
                        <div className="profile__field">
                            <label className="profile__label">
                                <span className="profile__label-icon">📧</span>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                className="profile__input"
                                placeholder="Digite seu email"
                                required
                            />
                        </div>
                        
                        <div className="profile__field">
                            <label className="profile__label">
                                <span className="profile__label-icon">📝</span>
                                Biografia
                            </label>
                            <textarea
                                name="bio"
                                value={user.bio}
                                onChange={handleChange}
                                className="profile__input profile__textarea"
                                placeholder="Conte um pouco sobre você..."
                                rows={4}
                            />
                        </div>
                        
                        <div className="profile__actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="profile__btn profile__btn--secondary"
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="profile__btn profile__btn--primary"
                                disabled={saving}
                            >
                                {saving ? 'Salvando...' : 'Salvar alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;