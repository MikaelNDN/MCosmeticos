"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Image from "next/image";

interface PageProps {
    params: Promise<{ id: string }>;
}

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

export default function PerfumeDetalhesPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [perfume, setPerfume] = useState<Perfume | null>(null);
    const [mesmaLinha, setMesmaLinha] = useState<Perfume[]>([]);
    const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function carregarDetalhesE_Relacionados() {
            try {
                if (!resolvedParams?.id) return;

                const response = await api.get(`/api/perfumes/${resolvedParams.id}`);
                if (isMounted && response.data) {
                    const perfumeAtual = response.data;
                    setPerfume(perfumeAtual);

                    try {
                        const allResponse = await api.get("/api/perfumes");
                        const listaGeral = allResponse.data.content ? allResponse.data.content : allResponse.data;

                        if (isMounted && Array.isArray(listaGeral)) {
                            const relacionados = listaGeral.filter((p: Perfume) => {
                                if (p.id === perfumeAtual.id) return false;
                                if (!perfumeAtual.linha || !p.linha) return false;
                                return p.linha.trim().toLowerCase() === perfumeAtual.linha.trim().toLowerCase();
                            });
                            setMesmaLinha(relacionados);
                        }
                    } catch (err) {
                        console.error("Erro ao carregar perfumes da mesma linha:", err);
                    }
                }

                const token = localStorage.getItem("token");
                if (token) {
                    try {
                        const favResponse = await api.get("/api/favoritos");
                        if (isMounted && Array.isArray(favResponse.data)) {
                            const ids = new Set<string>(favResponse.data.map((p: Perfume) => p.id));
                            setFavoritosIds(ids);
                        }
                    } catch (err) {
                        console.error("Erro ao carregar favoritos:", err);
                    }
                }

            } catch (error) {
                console.error("Erro ao carregar detalhes do perfume:", error);
                if (isMounted) setErro(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        carregarDetalhesE_Relacionados();

        return () => { isMounted = false; };
    }, [resolvedParams?.id]);

    const handleComprarWhatsApp = async () => {
        if (!perfume) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Faça login para realizar o pedido via WhatsApp!");
            router.push("/login");
            return;
        }

        try {
            const response = await api.get(`/api/vendas/whatsapp/${perfume.id}`);
            const urlWhatsApp = response.data.whatsappUrl;

            if (urlWhatsApp) {
                window.open(urlWhatsApp, "_blank");
            } else {
                throw new Error("URL do WhatsApp não retornada");
            }
        } catch (error) {
            console.error("Erro ao gerar link do WhatsApp:", error);
            alert("Não foi possível gerar o link de atendimento. Verifique se está logado.");
        }
    };

    const handleToggleFavorito = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Faça login para salvar suas fragrâncias favoritas!");
            router.push("/login");
            return;
        }

        try {
            await api.post(`/api/favoritos/${id}`);

            setFavoritosIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
                return newSet;
            });
        } catch (error) {
            console.error("Erro ao favoritar:", error);
            alert("Erro ao salvar favorito.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-sans">
                Carregando essência...
            </div>
        );
    }

    if (erro || !perfume) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-center px-6 text-zinc-100 font-sans">
                <p className="text-sm text-zinc-400 mb-4 font-light">Fragrância não encontrada ou indisponível.</p>
                <button
                    onClick={() => router.push("/vitrine")}
                    className="bg-white text-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg"
                >
                    Voltar à Vitrine
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-white selection:text-black">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span
                        className="text-lg font-bold tracking-wide text-white cursor-pointer"
                        onClick={() => router.push("/vitrine")}
                    >
                        M. COSMÉTICOS
                    </span>
                    <button
                        onClick={() => router.push("/vitrine")}
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-1.5"
                    >
                        <span>&larr; Voltar à Vitrine</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Cartão principal super compacto */}
                <div className="bg-[#141414] border border-zinc-800 p-5 md:p-6 rounded-2xl shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                        {/* Imagem compacta (coluna menor) */}
                        <div className="md:col-span-5 aspect-[4/5] w-full bg-[#0D0D0D] relative overflow-hidden flex items-center justify-center rounded-xl border border-zinc-800 max-w-[260px] mx-auto md:max-w-none">
                            <button
                                onClick={(e) => handleToggleFavorito(e, perfume.id)}
                                className="absolute top-2.5 right-2.5 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md border border-zinc-700 hover:bg-black/90 transition-all"
                                aria-label="Favoritar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className={`w-3.5 h-3.5 transition-colors ${favoritosIds.has(perfume.id) ? 'fill-white text-white' : 'fill-transparent text-zinc-400'}`}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                            </button>

                            {perfume.imagemUrl ? (
                                <Image
                                    src={perfume.imagemUrl}
                                    alt={perfume.nome}
                                    fill
                                    priority
                                    className="object-cover object-center"
                                />
                            ) : (
                                <span className="text-[10px] tracking-widest uppercase text-zinc-700">Sem Imagem</span>
                            )}

                            {perfume.estoque === 0 && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-black bg-white px-3 py-1 rounded-full shadow">Esgotado</span>
                                </div>
                            )}
                        </div>

                        {/* Detalhes e Ações (coluna maior) */}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                            <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">{perfume.marca}</span>
                                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">{perfume.nome}</h1>
                                {perfume.linha && <p className="text-xs text-zinc-400 font-light">{perfume.linha}</p>}

                                <div className="mt-2 text-lg font-bold text-white">
                                    R$ {Number(perfume.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>

                                <div className="mt-3 border-t border-zinc-800 pt-3">
                                    <h3 className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Descrição</h3>
                                    <p className="text-xs text-zinc-300 font-light leading-relaxed line-clamp-3">{perfume.descricao}</p>
                                </div>

                                <div className="mt-2">
                                    <span className="text-[11px] text-zinc-400">
                                        Estoque: <strong className="text-white font-medium">{perfume.estoque} un.</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-800">
                                <button
                                    onClick={handleComprarWhatsApp}
                                    disabled={perfume.estoque === 0}
                                    className="w-full bg-white text-black py-2.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-200 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                        <path d="M12.031 2C6.5 2 2 6.5 2 12.031c0 2.122.65 4.092 1.767 5.735L2.24 21.84l4.195-1.488a9.99 9.99 0 0 0 5.596 1.679c5.531 0 10.031-4.5 10.031-10.03C22.062 6.5 17.562 2 12.031 2zm5.823 14.198c-.247.697-1.438 1.303-1.983 1.385-.515.077-1.168.14-3.766-.921-3.21-1.319-5.291-4.584-5.451-4.796-.16-.212-1.303-1.734-1.303-3.308 0-1.574.823-2.348 1.114-2.668.291-.32.634-.4.845-.4.212 0 .424.002.609.012.196.01.46-.074.717.533.275.649.953 2.327 1.036 2.496.083.169.138.366.027.587-.111.221-.167.36-.33.559-.163.199-.342.443-.489.595-.164.17-.336.356-.145.688.191.332.848 1.399 1.822 2.266 1.253 1.116 2.308 1.462 2.639 1.626.332.164.524.137.718-.088.194-.225.835-.972 1.058-1.304.223-.332.445-.278.749-.165.304.113 1.93.91 2.262 1.076.332.166.554.249.635.385.081.136.081.792-.166 1.489z"/>
                                    </svg>
                                    {perfume.estoque > 0 ? "Comprar via WhatsApp" : "Produto Esgotado"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção de Relacionados (aparece logo abaixo, facilitando a visualização imediata) */}
                {mesmaLinha.length > 0 && (
                    <div className="mt-8">
                        <div className="border-t border-zinc-800 pt-6 mb-4 flex items-baseline justify-between">
                            <div>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Da mesma linha</span>
                                <h2 className="text-lg font-bold text-white tracking-tight">Explore também</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {mesmaLinha.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/perfume/${item.id}`)}
                                    className="group cursor-pointer flex flex-col bg-[#141414] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 transition-all"
                                >
                                    <div className="aspect-[4/5] w-full bg-[#0D0D0D] relative overflow-hidden flex items-center justify-center">
                                        <button
                                            onClick={(e) => handleToggleFavorito(e, item.id)}
                                            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/50 backdrop-blur-md border border-zinc-700 hover:bg-black/90 transition-all"
                                            aria-label="Favoritar"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className={`w-3 h-3 transition-colors ${favoritosIds.has(item.id) ? 'fill-white text-white' : 'fill-transparent text-zinc-400'}`}
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                            </svg>
                                        </button>

                                        {item.imagemUrl ? (
                                            <img
                                                src={item.imagemUrl}
                                                alt={item.nome}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-zinc-700 uppercase">Sem Imagem</span>
                                        )}
                                    </div>

                                    <div className="p-2.5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-semibold block truncate">{item.marca}</span>
                                            <h3 className="text-xs font-medium text-zinc-100 line-clamp-1 group-hover:text-white">{item.nome}</h3>
                                        </div>
                                        <div className="mt-1.5 pt-1.5 border-t border-zinc-800/80 flex justify-between items-center">
                                            <span className="text-[9px] text-zinc-500">Valor</span>
                                            <span className="text-xs font-bold text-white">
                                                R$ {Number(item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}