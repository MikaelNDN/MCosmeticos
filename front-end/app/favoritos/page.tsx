"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface Perfume {
    id: string;
    nome: string;
    marca: string;
    linha?: string;
    descricao: string;
    preco: number;
    estoque: number;
    imagemUrl?: string;
}

export default function FavoritosPage() {
    useAuthGuard();
    const router = useRouter();
    const [favoritos, setFavoritos] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Você precisa estar logado para ver seus favoritos.");
            router.push("/login");
            return;
        }

        let isMounted = true;

        async function carregarFavoritos() {
            try {
                const response = await api.get("/api/favoritos");
                console.log("DADOS BRUTOS RECEBIDOS DOS FAVORITOS:", response.data);

                if (isMounted) {
                    const dadosBrutos = Array.isArray(response.data) ? response.data : Object.values(response.data);

                    const perfumesFavoritos = dadosBrutos
                        .map((item: unknown) => {
                            const obj = item as Record<string, unknown>;
                            // Pega os dados do perfume considerando variações de estrutura
                            const p = (obj?.perfume || obj) as Record<string, unknown>;

                            // Normaliza cada campo com segurança para evitar undefined, null ou NaN
                            return {
                                id: String(p?.id || ''),
                                nome: String(p?.nome || ''),
                                marca: String(p?.marca || ''),
                                linha: p?.linha ? String(p.linha) : undefined,
                                descricao: String(p?.descricao || ''),
                                preco: Number(p?.preco ?? p?.valor ?? 0),
                                estoque: Number(p?.estoque ?? 0),
                                imagemUrl: String(p?.imagemUrl || p?.imagem_url || ''),
                            } as Perfume;
                        })
                        // Remove qualquer item que venha sem ID ou com preço inválido/NaN
                        .filter((perfume: Perfume) => perfume.id && !isNaN(perfume.preco) && perfume.preco > 0);

                    setFavoritos(perfumesFavoritos);
                }
            } catch (error) {
                console.error("Erro ao carregar favoritos:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        carregarFavoritos();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleRemoverFavorito = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await api.post(`/api/favoritos/${id}`);
            setFavoritos(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Erro ao remover favorito:", error);
            alert("Não foi possível atualizar os favoritos.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-sans">
                Carregando favoritos...
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

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Sua Seleção</span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">Fragrâncias Favoritas</h1>
                </div>

                {favoritos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-sm text-zinc-500 font-light mb-6">Você ainda não possui fragrâncias salvas nos favoritos.</p>
                        <button
                            onClick={() => router.push("/vitrine")}
                            className="bg-white text-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg"
                        >
                            Explorar Vitrine
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {favoritos.map((perfume, index) => (
                            <div
                                key={perfume.id || index}
                                onClick={() => router.push(`/perfume/${perfume.id}`)}
                                className="group cursor-pointer flex flex-col bg-[#141414] border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[3/4] w-full bg-[#0D0D0D] relative overflow-hidden flex items-center justify-center">
                                    <button
                                        onClick={(e) => handleRemoverFavorito(e, perfume.id)}
                                        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-zinc-700 hover:bg-black/80 hover:scale-110 text-red-400 transition-all duration-300"
                                        title="Remover dos favoritos"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                        </svg>
                                    </button>

                                    {perfume.imagemUrl ? (
                                        <img
                                            src={perfume.imagemUrl}
                                            alt={perfume.nome}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <span className="text-xs tracking-widest uppercase text-zinc-700">Sem Imagem</span>
                                    )}
                                </div>

                                <div className="p-5 flex flex-col flex-1 justify-between">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{perfume.marca}</span>
                                        <h2 className="text-lg font-medium text-zinc-100 mt-1 line-clamp-1 group-hover:text-white transition-colors">{perfume.nome}</h2>
                                        {perfume.linha && <p className="text-xs text-zinc-500 font-light mt-1">{perfume.linha}</p>}
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Valor</span>
                                        <span className="text-lg font-bold text-white">
                                            R$ {Number(perfume.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}