"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Image from "next/image";

interface Perfume {
    id: string;
    nome: string;
    marca: string;
    linha: string;
    descricao: string;
    preco: number;
    estoque: number;
    imagemUrl?: string;
    imagem_url?: string;
}

export default function VitrinePage() {
    const router = useRouter();
    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());

    const [termoBusca, setTermoBusca] = useState("");
    const [marcaBusca, setMarcaBusca] = useState("");

    const [logado, setLogado] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);


    const filtrarUmPorLinha = (dados: unknown): Perfume[] => {
        let arrayBruto: unknown[] = [];


        if (Array.isArray(dados)) {
            arrayBruto = dados;
        }

        else if (dados && typeof dados === "object") {
            const obj = dados as Record<string, unknown>;

            if (Array.isArray(obj.content)) {
                arrayBruto = obj.content;
            }

            else if (Array.isArray(obj.data)) {
                arrayBruto = obj.data;
            }

            else if (obj.data && typeof obj.data === "object") {
                const innerObj = obj.data as Record<string, unknown>;
                if (Array.isArray(innerObj.content)) {
                    arrayBruto = innerObj.content;
                } else if (Array.isArray(innerObj.data)) {
                    arrayBruto = innerObj.data;
                }
            }
        }


        const listaSegura = arrayBruto as Perfume[];

        const linhasVistas = new Set();
        return listaSegura.filter((perfume) => {
            if (!perfume || !perfume.linha || perfume.linha.trim() === "") {
                return true;
            }
            const linhaFormatada = perfume.linha.trim().toLowerCase();
            if (linhasVistas.has(linhaFormatada)) {
                return false;
            } else {
                linhasVistas.add(linhaFormatada);
                return true;
            }
        });
    };

    const carregarCatalogo = async (nome = "", marca = "") => {
        setLoading(true);
        try {
            let url = "/api/perfumes";
            const params = new URLSearchParams();
            if (nome) params.append("nome", nome);
            if (marca) params.append("marca", marca);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            setPerfumes(filtrarUmPorLinha(response.data));
        } catch (error) {
            console.error("Erro ao carregar vitrine:", error);
            setPerfumes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("token");

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLogado(!!token);
        const role = localStorage.getItem("role");
        setIsAdmin(role ? role.toUpperCase() === "ADMIN" : false);

        async function fetchInitialData() {
            try {
                const response = await api.get("/api/perfumes");
                if (isMounted) {
                    setPerfumes(filtrarUmPorLinha(response.data));
                }
            } catch (error) {
                console.error("Erro ao carregar vitrine:", error);
                if (isMounted) setPerfumes([]);
            } finally {
                if (isMounted) setLoading(false);
            }

            if (token) {
                try {
                    const favResponse = await api.get("/api/favoritos");
                    if (isMounted && Array.isArray(favResponse.data)) {
                        const ids = new Set<string>(favResponse.data.map((p: Perfume) => p.id));
                        setFavoritosIds(ids);
                    }
                } catch (error) {
                    console.error("Erro ao carregar favoritos:", error);
                }
            }
        }

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        carregarCatalogo(termoBusca, marcaBusca);
    };

    const handleLimparFiltros = () => {
        setTermoBusca("");
        setMarcaBusca("");
        carregarCatalogo();
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

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-white selection:text-black font-sans">
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="cursor-pointer group" onClick={() => handleLimparFiltros()}>
                        <span className="text-xl font-bold tracking-wide text-white group-hover:text-zinc-300 transition-colors">
                            M. COSMÉTICOS
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        {logado ? (
                            <>
                                <button
                                    onClick={() => router.push("/favoritos")}
                                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                                >
                                    <span>Favoritos</span>
                                    {favoritosIds?.size > 0 && (
                                        <span className="bg-white text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {favoritosIds.size}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => router.push("/perfil")}
                                    className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium"
                                >
                                    Meu Perfil
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push("/login")}
                                className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium"
                            >
                                Entrar
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={() => router.push("/admin")}
                                className="text-xs uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors font-medium border-l border-zinc-800 pl-6"
                            >
                                Área Restrita
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <section className="relative w-full h-[450px] overflow-hidden flex items-center justify-center text-center">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/banner.png"
                        alt="Banner Exclusivo"
                        fill
                        priority
                        className="object-cover object-center opacity-60 scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A] z-10"></div>
                </div>

                <div className="relative z-20 max-w-3xl mx-auto px-6 text-white space-y-4">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold bg-zinc-900/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-800">
                        Coleção Exclusiva
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mt-4">
                        A Essência da Elegância
                    </h1>
                    <p className="text-sm md:text-base text-zinc-400 font-normal tracking-wide max-w-xl mx-auto">
                        Fragrâncias raras e atemporais desenvolvidas para marcar presença com distinção e sofisticação.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <form onSubmit={handleSearch} className="bg-[#141414] border border-zinc-800 p-2 rounded-xl shadow-2xl flex flex-col sm:flex-row gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Buscar essência..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="bg-[#0A0A0A] border border-zinc-800 focus:border-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 flex-1 w-full text-white"
                    />
                    <input
                        type="text"
                        placeholder="Marca..."
                        value={marcaBusca}
                        onChange={(e) => setMarcaBusca(e.target.value)}
                        className="bg-[#0A0A0A] border border-zinc-800 focus:border-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 w-full sm:w-48 text-white"
                    />
                    <button type="submit" className="bg-white text-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-zinc-200 transition-colors font-bold w-full sm:w-auto">
                        Buscar
                    </button>
                    {(termoBusca || marcaBusca) && (
                        <button type="button" onClick={handleLimparFiltros} className="text-[10px] uppercase tracking-widest px-4 py-3 text-zinc-500 hover:text-white transition-colors">
                            Limpar
                        </button>
                    )}
                </form>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-20">
                {loading ? (
                    <div className="flex justify-center items-center py-32 text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
                        Carregando essências...
                    </div>
                ) : perfumes.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-32 text-center">
                        <p className="text-sm text-zinc-500 mb-6">Nenhuma fragrância encontrada.</p>
                        <button
                            onClick={handleLimparFiltros}
                            className="text-xs uppercase tracking-widest bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            Redefinir Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {perfumes.map((perfume) => (
                            <div
                                key={perfume.id}
                                onClick={() => router.push(`/perfume/${perfume.id}`)}
                                className="group cursor-pointer flex flex-col bg-[#141414] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="aspect-[4/5] w-full bg-[#0D0D0D] relative flex items-center justify-center overflow-hidden">
                                    <button
                                        onClick={(e) => handleToggleFavorito(e, perfume.id)}
                                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-zinc-700 hover:bg-black/80 hover:scale-110 transition-all duration-300"
                                        aria-label="Favoritar"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className={`w-3.5 h-3.5 transition-colors duration-300 ${favoritosIds?.has(perfume.id) ? 'fill-white text-white' : 'fill-transparent text-zinc-400'}`}
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                    </button>

                                    {perfume.estoque === 0 && (
                                        <div className="absolute top-3 left-3 z-20">
                                            <span className="text-[9px] uppercase tracking-wider font-bold text-black bg-white px-2.5 py-1 rounded-full shadow">
                                                Esgotado
                                            </span>
                                        </div>
                                    )}

                                    {perfume.imagemUrl || perfume.imagem_url ? (
                                        <img
                                            src={perfume.imagemUrl || perfume.imagem_url}
                                            alt={perfume.nome}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <span className="text-[10px] tracking-widest uppercase text-zinc-700">Sem Imagem</span>
                                    )}
                                </div>

                                <div className="p-3.5 flex flex-col flex-1 justify-between">
                                    <div>
                                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">
                                            {perfume.marca}
                                        </span>
                                        <h2 className="text-sm font-medium text-zinc-100 mt-0.5 line-clamp-1 group-hover:text-white transition-colors">
                                            {perfume.nome}
                                        </h2>
                                        {perfume.linha && (
                                            <p className="text-[11px] text-zinc-500 font-light mt-0.5">
                                                {perfume.linha}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-500">Valor</span>
                                        <span className="text-sm font-bold text-white">
                                            R$ {Number(perfume.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="border-t border-zinc-800 bg-[#0A0A0A] py-16 mt-12 text-zinc-400">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <span className="text-lg font-bold tracking-wide text-white">M. COSMÉTICOS</span>
                        <p className="text-sm font-light leading-relaxed text-zinc-500">
                            Haute Parfumerie. Fragrâncias raras e atemporais desenvolvidas para marcar presença com distinção e sofisticação inconfundível.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Navegação</h4>
                        <ul className="space-y-2 text-sm font-light text-zinc-400">
                            <li><span onClick={() => router.push("/vitrine")} className="hover:text-white cursor-pointer transition-colors">Vitrine Exclusiva</span></li>
                            <li><span onClick={() => router.push("/favoritos")} className="hover:text-white cursor-pointer transition-colors">Meus Favoritos</span></li>
                            <li><span onClick={() => router.push("/perfil")} className="hover:text-white cursor-pointer transition-colors">Minha Conta</span></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Atendimento</h4>
                        <p className="text-sm font-light text-zinc-500">Suporte exclusivo via e-mail e canais oficiais.</p>
                        <p className="text-sm text-white font-medium">contato@mcosmeticos.com.br</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Redes Sociais</h4>
                        <div className="flex flex-col space-y-3 text-sm font-light">
                            <a href="#" className="hover:text-white transition-colors">@m_cosmetico2026</a>
                            <a href="#" className="hover:text-white transition-colors">WhatsApp</a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 border-t border-zinc-800/50 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-600 font-light">
                    <p>&copy; 2026 M. Cosméticos. All Rights Reserved.</p>
                    <p className="mt-2 sm:mt-0">Desenvolvido com elegância e tecnologia.</p>
                </div>
            </footer>
        </div>
    );
}