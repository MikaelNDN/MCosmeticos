"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/services/api";

interface UsuarioPerfil {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    dataNascimento?: string;
    role: string;
}

export default function PerfilPage() {
    useAuthGuard();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para acessar seu perfil.");
            router.push("/login");
            return;
        }

        let isMounted = true;

        async function carregarPerfil() {
            try {

                const response = await api.get("/api/usuarios/me");
                const dadosBrutos = response.data.content ? response.data.content : response.data;
                const listaSegura = Array.isArray(dadosBrutos) ? dadosBrutos : [];
                if (isMounted) {
                    setUsuario(response.data);
                }
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        carregarPerfil();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-sans">
                Carregando perfil...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-white selection:text-black">
            {/* Header Dark Mode */}
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <span
                        className="text-xl font-bold tracking-wide text-white cursor-pointer"
                        onClick={() => router.push("/vitrine")}
                    >
                        M. COSMÉTICOS
                    </span>
                    <button
                        onClick={() => router.push("/vitrine")}
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                    >
                        <span>&larr; Voltar à Vitrine</span>
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Painel do Cliente</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">Meu Perfil</h1>
                </div>

                <div className="bg-[#141414] border border-zinc-800 p-8 md:p-12 rounded-2xl shadow-2xl space-y-8">
                    {usuario ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block mb-1">Nome</label>
                                    <p className="text-sm font-normal text-zinc-100 border-b border-zinc-800 pb-2">{usuario.nome}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block mb-1">Sobrenome</label>
                                    <p className="text-sm font-normal text-zinc-100 border-b border-zinc-800 pb-2">{usuario.sobrenome}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block mb-1">E-mail de Acesso</label>
                                    <p className="text-sm font-normal text-zinc-100 border-b border-zinc-800 pb-2">{usuario.email}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block mb-1">Data de Nascimento</label>
                                    <p className="text-sm font-normal text-zinc-100 border-b border-zinc-800 pb-2">
                                        {usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString('pt-BR') : 'Não informada'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <button
                                    onClick={() => router.push("/favoritos")}
                                    className="w-full sm:w-auto border border-zinc-700 text-zinc-100 text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-all duration-300 font-medium"
                                >
                                    Ver Meus Favoritos
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto bg-red-500/10 border border-red-500/20 text-red-400 text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold cursor-pointer"
                                >
                                    Sair da Conta
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400 font-light text-center py-8">Não foi possível carregar as informações do usuário.</p>
                    )}
                </div>
            </main>
        </div>
    );
}