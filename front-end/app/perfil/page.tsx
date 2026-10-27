"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import api from "@/services/api";

interface UsuarioPerfil {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    dataNascimento?: string;
}

// Evita o bug de fuso: new Date("1990-05-10") é UTC e pode exibir um dia a menos no Brasil.
const formatarData = (iso?: string) => {
    if (!iso) return "Não informada";
    const [ano, mes, dia] = iso.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
};

function Campo({ label, valor }: { label: string; valor: string }) {
    return (
        <div>
            <dt className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                {label}
            </dt>
            <dd className="text-sm font-normal text-zinc-100 border-b border-zinc-800 pb-2">
                {valor}
            </dd>
        </div>
    );
}

export default function PerfilPage() {
    useAuthGuard(); // único ponto de verificação de login

    const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function carregarPerfil() {
            try {
                const { data } = await api.get("/api/usuarios/me");
                if (isMounted) setUsuario(data);
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
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.replace("/login"); // replace: o "voltar" não retorna ao perfil
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
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between">
                    <Link
                        href="/vitrine"
                        className="text-xs sm:text-xl font-bold tracking-wider text-white hover:text-zinc-300 transition-colors whitespace-nowrap"
                    >
                        M. COSMÉTICOS
                    </Link>
                    <Link
                        href="/vitrine"
                        className="text-[11px] sm:text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium"
                    >
                        &larr; Voltar à Vitrine
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10 sm:py-16">
                <div className="mb-8 sm:mb-12">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
                        Painel do Cliente
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">
                        Meu Perfil
                    </h1>
                </div>

                <div className="bg-[#141414] border border-zinc-800 p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl space-y-8">
                    {usuario ? (
                        <>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Campo label="Nome" valor={usuario.nome} />
                                <Campo label="Sobrenome" valor={usuario.sobrenome} />
                                <Campo label="E-mail de Acesso" valor={usuario.email} />
                                <Campo
                                    label="Data de Nascimento"
                                    valor={formatarData(usuario.dataNascimento)}
                                />
                            </dl>

                            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <Link
                                    href="/favoritos"
                                    className="w-full sm:w-auto text-center border border-zinc-700 text-zinc-100 text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-800 hover:text-white transition-all duration-300 font-medium"
                                >
                                    Ver Meus Favoritos
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full sm:w-auto bg-red-500/10 border border-red-500/20 text-red-400 text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-colors font-bold cursor-pointer"
                                >
                                    Sair da Conta
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-zinc-400 font-light text-center py-8">
                            Não foi possível carregar as informações do usuário.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
