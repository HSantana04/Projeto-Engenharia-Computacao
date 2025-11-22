import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './Profile.css';
const Profile = () => {
    const [user, setUser] = useState({
        name: "João Silva",
        email: "joao.silva@email.com",
        bio: "Desenvolvedor apaixonado por tecnologia e finanças.",
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            console.error(error);
            alert("Falha ao atualizar perfil");
        }
        finally {
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
        return (_jsxs("div", { className: "profile__loading", children: [_jsx("div", { className: "profile__loading-spinner" }), "Carregando perfil..."] }));
    }
    return (_jsx("div", { className: "profile", children: _jsxs("div", { className: "profile__container", children: [_jsxs("div", { className: "profile__header", children: [_jsx("h1", { className: "profile__title", children: "Meu Perfil" }), _jsx("p", { className: "profile__subtitle", children: "Gerencie suas informa\u00E7\u00F5es pessoais" })] }), _jsxs("div", { className: "profile__card", children: [_jsxs("div", { className: "profile__avatar", children: [_jsx("div", { className: "profile__avatar-img", children: user.name.charAt(0).toUpperCase() }), _jsxs("label", { className: "profile__avatar-upload", children: [_jsx("input", { type: "file", accept: "image/*" }), "\uD83D\uDCF7 Alterar foto"] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "profile__form", children: [_jsxs("div", { className: "profile__field", children: [_jsxs("label", { className: "profile__label", children: [_jsx("span", { className: "profile__label-icon", children: "\uD83D\uDC64" }), "Nome completo"] }), _jsx("input", { type: "text", name: "name", value: user.name, onChange: handleChange, className: "profile__input", placeholder: "Digite seu nome completo", required: true })] }), _jsxs("div", { className: "profile__field", children: [_jsxs("label", { className: "profile__label", children: [_jsx("span", { className: "profile__label-icon", children: "\uD83D\uDCE7" }), "Email"] }), _jsx("input", { type: "email", name: "email", value: user.email, onChange: handleChange, className: "profile__input", placeholder: "Digite seu email", required: true })] }), _jsxs("div", { className: "profile__field", children: [_jsxs("label", { className: "profile__label", children: [_jsx("span", { className: "profile__label-icon", children: "\uD83D\uDCDD" }), "Biografia"] }), _jsx("textarea", { name: "bio", value: user.bio, onChange: handleChange, className: "profile__input profile__textarea", placeholder: "Conte um pouco sobre voc\u00EA...", rows: 4 })] }), _jsxs("div", { className: "profile__actions", children: [_jsx("button", { type: "button", onClick: handleCancel, className: "profile__btn profile__btn--secondary", disabled: saving, children: "Cancelar" }), _jsx("button", { type: "submit", className: "profile__btn profile__btn--primary", disabled: saving, children: saving ? 'Salvando...' : 'Salvar alterações' })] })] })] })] }) }));
};
export default Profile;
