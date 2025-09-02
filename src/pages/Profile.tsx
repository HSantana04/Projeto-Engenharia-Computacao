import React, { useState, useEffect } from 'react';

interface UserProfile {
    name: string;
    email: string;
    bio?: string;
}

const Profile: React.FC = () => {
    const [user, setsetUser] = useState<UserProfile>({
        name: "",
        email: "",
        bio: "",
    });

    const [loading, setLoading] = useState(true);

    // Simulação de busca de usuário (pode vir de uma API real)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('https://api.example.com/user');
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) throw new Error("Erro ao atualizar usuário");

            alert("Perfil atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Falha ao atualizar perfil");
        }
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nome</label>
                    <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Bio</label>
                    <textarea
                        name="bio"
                        value={user.bio}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Salvar
                </button>
            </form>
        </div>
    );
};

export default Profile;