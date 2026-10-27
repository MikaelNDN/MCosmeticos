"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

interface Perfume {
    id: string;
    nome: string;
    marca: string;
    linha: string;
    descricao: string;
    preco: number;
    estoque: number;
    imagemUrl?: string;
}

// Formato cru da API (aceita os dois nomes de campo e normaliza)
type PerfumeApi = Omit<Perfume, "imagemUrl"> & {
    imagemUrl?: string;
    imagem_url?: string;
};

/* ------------------------------------------------------------------ */
/* Constantes e utilitários                                            */
/* ------------------------------------------------------------------ */

const TAMANHO_PAGINA = 60; // mesmo tamanho na carga inicial e na busca
const DESCONTO_AVISTA = 0.1;
const PERCENTUAL_DESCONTO = Math.round(DESCONTO_AVISTA * 100);
const INTERVALO_CARROSSEL_MS = 3000;
const RETOMAR_APOS_TOQUE_MS = 4000;

const formatarPreco = (valor: number | string) =>
    Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const precoAVista = (preco: number | string) => Number(preco) * (1 - DESCONTO_AVISTA);

const normalizarPerfume = ({ imagem_url, ...resto }: PerfumeApi): Perfume => ({
    ...resto,
    imagemUrl: resto.imagemUrl ?? imagem_url,
});

// Renomeie os arquivos em /public para estes nomes (sem espaços e acentos).
const guiaAmbientes = [
    {
        id: "trabalho",
        titulo: "Trabalho & Escritório",
        subtitulo: "Discreto & Elegante",
        descricao:
            "Notas cítricas, florais suaves e amadeirados leves que fixam com sofisticação sem incomodar no dia a dia.",
        tag: "Cítricos & Florais",
        imagem: "/guia-trabalho.png",
    },
    {
        id: "noite",
        titulo: "Encontros & Noite",
        subtitulo: "Marcante & Sensual",
        descricao:
            "Fragrâncias orientais, gourmand e especiadas com projeção envolvente e rastro inesquecível.",
        tag: "Orientais & Baunilha",
        imagem: "/guia-noite.png",
    },
    {
        id: "esportes",
        titulo: "Esportes & Dias Quentes",
        subtitulo: "Refrescante & Energizante",
        descricao:
            "Acordes aquáticos, mentolados e frutados frescos para manter a sensação contínua de banho tomado.",
        tag: "Aquáticos & Herbais",
        imagem: "/guia-esportes.png",
    },
    {
        id: "eventos",
        titulo: "Eventos & Ocasiões Especiais",
        subtitulo: "Imponente & Atemporal",
        descricao:
            "Amadeirados intensos, notas de couro, ambarados e oud desenvolvidos para criar presença de destaque.",
        tag: "Amadeirados & Ambarados",
        imagem: "/guia-eventos.png",
    },
];

const navLinkClass =
    "text-[11px] sm:text-sm uppercase tracking-wider text-zinc-300 hover:text-white transition-colors font-semibold px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60";

const inputClass =
    "bg-[#121212] border border-zinc-700 focus:border-zinc-400 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition-all placeholder:text-zinc-400 w-full text-white";

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function VitrinePage() {
    const router = useRouter();

    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritosIds, setFavoritosIds] = useState<Set<string>>(new Set());

    const [termoBusca, setTermoBusca] = useState("");
    const [marcaBusca, setMarcaBusca] = useState(""); // marca selecionada
    const [marcas, setMarcas] = useState<string[]>([]); // lista fixa de marcas

    const [logado, setLogado] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // apenas visual: valide ADMIN no backend

    const [guiaIndex, setGuiaIndex] = useState(0);
    const [isPausado, setIsPausado] = useState(false);
    const carrosselRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const toqueTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    /* ---------------------------- Catálogo ---------------------------- */

    const carregarCatalogo = useCallback(async (nome = "", marca = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ size: String(TAMANHO_PAGINA) });
            if (nome) params.append("nome", nome);
            if (marca) params.append("marca", marca);

            const { data } = await api.get(`/api/perfumes?${params.toString()}`);
            const lista = data?.content ?? data;

            const carregados: Perfume[] = Array.isArray(lista) ? lista.map(normalizarPerfume) : [];
            setPerfumes(carregados);

            // A lista de marcas só é montada na carga sem filtros,
            // para não encolher quando o usuário seleciona uma marca.
            if (!nome && !marca) {
                const unicas = Array.from(
                    new Set(carregados.map((p) => p.marca).filter(Boolean))
                ).sort((a, b) => a.localeCompare(b, "pt-BR"));
                setMarcas(unicas);
            }
        } catch (error) {
            console.error("Erro ao carregar vitrine:", error);
            setPerfumes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /* ------------------- Carga inicial (auth + dados) ------------------ */

    useEffect(() => {
        let ativo = true;

        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        setLogado(!!token);
        setIsAdmin(role?.toUpperCase() === "ADMIN");

        carregarCatalogo();

        if (token) {
            (async () => {
                try {
                    const { data } = await api.get("/api/favoritos");
                    if (ativo && Array.isArray(data)) {
                        setFavoritosIds(new Set<string>(data.map((p: Perfume) => p.id)));
                    }
                } catch (error) {
                    console.error("Erro ao carregar favoritos:", error);
                }
            })();
        }

        return () => {
            ativo = false;
        };
    }, [carregarCatalogo]);

    /* ----------------------------- Carrossel --------------------------- */

    // Auto-play
    useEffect(() => {
        if (isPausado) return;

        const id = setInterval(
            () => setGuiaIndex((prev) => (prev + 1) % guiaAmbientes.length),
            INTERVALO_CARROSSEL_MS
        );

        return () => clearInterval(id);
    }, [isPausado]);

    // índice -> scroll (só rola se ainda não estiver na posição certa)
    useEffect(() => {
        const el = carrosselRef.current;
        if (!el) return;

        const atual = Math.round(el.scrollLeft / el.clientWidth);
        if (atual !== guiaIndex) {
            el.scrollTo({ left: el.clientWidth * guiaIndex, behavior: "smooth" });
        }
    }, [guiaIndex]);

    // scroll manual (swipe/trackpad) -> índice. O debounce evita briga com o
    // scroll programático: só atualiza quando o scroll para.
    const handleCarrosselScroll = () => {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            const el = carrosselRef.current;
            if (!el) return;
            const novo = Math.round(el.scrollLeft / el.clientWidth);
            setGuiaIndex((prev) => (prev === novo ? prev : novo));
        }, 100);
    };

    const handleTouchStart = () => {
        clearTimeout(toqueTimeout.current);
        setIsPausado(true);
    };

    const handleTouchEnd = () => {
        clearTimeout(toqueTimeout.current);
        toqueTimeout.current = setTimeout(() => setIsPausado(false), RETOMAR_APOS_TOQUE_MS);
    };

    useEffect(
        () => () => {
            clearTimeout(scrollTimeout.current);
            clearTimeout(toqueTimeout.current);
        },
        []
    );

    /* ------------------------------ Handlers --------------------------- */

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        carregarCatalogo(termoBusca, marcaBusca);
    };

    const handleSelecionarMarca = (marca: string) => {
        const nova = marcaBusca === marca ? "" : marca; // clicar de novo desmarca
        setMarcaBusca(nova);
        carregarCatalogo(termoBusca, nova);
    };

    const handleLimparFiltros = () => {
        setTermoBusca("");
        setMarcaBusca("");
        carregarCatalogo();
    };

    const handleToggleFavorito = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (!localStorage.getItem("token")) {
            alert("Faça login para salvar suas fragrâncias favoritas!");
            router.push("/login");
            return;
        }

        try {
            await api.post(`/api/favoritos/${id}`);

            setFavoritosIds((prev) => {
                const novo = new Set(prev);
                if (novo.has(id)) novo.delete(id);
                else novo.add(id);
                return novo;
            });
        } catch (error) {
            console.error("Erro ao favoritar:", error);
            alert("Erro ao salvar favorito.");
        }
    };

    /* -------------------------------- UI ------------------------------- */

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-white selection:text-black font-sans">
            {/* Header */}
            <header className="border-b border-zinc-700 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2">
                    <button type="button" onClick={handleLimparFiltros} className="group cursor-pointer shrink-0">
            <span className="text-xs sm:text-xl font-bold tracking-wider text-white group-hover:text-zinc-300 transition-colors whitespace-nowrap">
                M. COSMÉTICOS
            </span>
                    </button>

                    <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
                        <ThemeToggle />

                        {logado ? (
                            <>
                                <Link href="/favoritos" className={`${navLinkClass} flex items-center gap-1`}>
                                    <span>Favoritos</span>
                                    {favoritosIds.size > 0 && (
                                        <span className="bg-white text-black text-[9px] sm:text-xs px-1.5 py-0.2 rounded-full font-bold">
                                {favoritosIds.size}
                            </span>
                                    )}
                                </Link>
                                <Link href="/perfil" className={navLinkClass}>
                                    Perfil
                                </Link>
                            </>
                        ) : (
                            <Link href="/login" className={`${navLinkClass} px-2 sm:px-3`}>
                                Entrar
                            </Link>
                        )}

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className="text-[10px] sm:text-sm uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors font-bold border-l border-zinc-700 pl-1.5 sm:pl-3 py-1 whitespace-nowrap"
                            >
                                Admin
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full max-w-full h-[280px] sm:h-[380px] md:h-[450px] overflow-hidden flex items-center justify-center text-center">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="/banner.png"
                        alt="Banner Exclusivo"
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center opacity-60 scale-100 sm:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/60 via-transparent to-[#121212] z-10" />
                </div>

                <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-white space-y-2 sm:space-y-4">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-300 font-semibold bg-zinc-900/80 backdrop-blur-md px-3 sm:px-4 py-1 rounded-full border border-zinc-700 inline-block">
                        Coleção Exclusiva
                    </span>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mt-1 sm:mt-4">
                        A Essência da Elegância
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-zinc-300 font-light tracking-wide max-w-xl mx-auto line-clamp-2 sm:line-clamp-none">
                        Fragrâncias raras e atemporais desenvolvidas para marcar presença com distinção.
                    </p>
                </div>
            </section>

            {/* Busca */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-20">
                <form
                    onSubmit={handleSearch}
                    className="bg-[#1C1C1E] border border-zinc-700 p-2 rounded-xl shadow-2xl flex flex-col sm:flex-row gap-2 items-center"
                >
                    <input
                        type="text"
                        placeholder="Buscar essência..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className={`${inputClass} flex-1`}
                    />
                    <button
                        type="submit"
                        className="bg-white text-black text-[11px] sm:text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold w-full sm:w-auto"
                    >
                        Buscar
                    </button>
                    {(termoBusca || marcaBusca) && (
                        <button
                            type="button"
                            onClick={handleLimparFiltros}
                            className="text-[10px] uppercase tracking-widest px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            Limpar
                        </button>
                    )}
                </form>

                {marcas.length > 0 && (
                    <div className="mt-3">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block mb-2">
                            Marcas
                        </span>
                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                            <button
                                type="button"
                                onClick={() => marcaBusca && handleSelecionarMarca(marcaBusca)}
                                aria-pressed={!marcaBusca}
                                className={`flex-shrink-0 text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-colors ${
                                    !marcaBusca
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-[#1C1C1E] text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
                                }`}
                            >
                                Todas
                            </button>
                            {marcas.map((marca) => {
                                const ativa = marcaBusca === marca;
                                return (
                                    <button
                                        key={marca}
                                        type="button"
                                        onClick={() => handleSelecionarMarca(marca)}
                                        aria-pressed={ativa}
                                        className={`flex-shrink-0 text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${
                                            ativa
                                                ? "bg-white text-black border-white font-bold"
                                                : "bg-[#1C1C1E] text-zinc-300 border-zinc-700 hover:border-zinc-500 hover:text-white"
                                        }`}
                                    >
                                        {marca}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Guia olfativo (carrossel) */}
            <section className="max-w-7xl mx-auto px-6 mt-8">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
                            Guia Olfativo
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Dicas de fragrâncias para cada ambiente
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {guiaAmbientes.map((item, idx) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setGuiaIndex(idx)}
                                className={`h-1 rounded-full transition-all cursor-pointer ${
                                    guiaIndex === idx ? "w-6 bg-white" : "w-2 bg-zinc-700 hover:bg-zinc-500"
                                }`}
                                aria-label={`Ir para a dica ${idx + 1}`}
                                aria-current={guiaIndex === idx}
                            />
                        ))}
                    </div>
                </div>

                <div
                    ref={carrosselRef}
                    onScroll={handleCarrosselScroll}
                    onMouseEnter={() => setIsPausado(true)}
                    onMouseLeave={() => setIsPausado(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl border border-zinc-700 bg-[#1C1C1E]"
                >
                    {guiaAmbientes.map((item, idx) => (
                        <div
                            key={item.id}
                            className="w-full flex-shrink-0 snap-start grid grid-cols-1 md:grid-cols-12 select-none overflow-hidden"
                        >
                            <div className="md:col-span-5 relative h-40 md:h-52 w-full overflow-hidden bg-[#28282A]">
                                <Image
                                    src={item.imagem}
                                    alt={item.titulo}
                                    fill
                                    sizes="(min-width: 768px) 40vw, 100vw"
                                    priority={idx === 0}
                                    className="object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1C1C1E]/40 via-transparent to-[#1C1C1E]" />
                                <span className="absolute top-3 left-3 text-[9px] uppercase tracking-widest font-bold text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-600">
                                    {item.tag}
                                </span>
                            </div>

                            <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-2">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold block">
                                        {item.subtitulo}
                                    </span>
                                    <h3 className="text-base sm:text-xl font-bold text-white mt-1">
                                        {item.titulo}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed mt-2 line-clamp-3">
                                        {item.descricao}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-zinc-700/80 flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                                    <span>Recomendação de Uso</span>
                                    <span className="text-white font-semibold">M. Cosméticos</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Catálogo */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center items-center py-32 text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
                        Carregando essências...
                    </div>
                ) : perfumes.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-32 text-center">
                        <p className="text-sm text-zinc-500 mb-6">Nenhuma fragrância encontrada.</p>
                        <button
                            type="button"
                            onClick={handleLimparFiltros}
                            className="text-xs uppercase tracking-widest bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            Redefinir Filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {perfumes.map((perfume) => {
                            const favorito = favoritosIds.has(perfume.id);

                            return (
                                <div
                                    key={perfume.id}
                                    onClick={() => router.push(`/perfume/${perfume.id}`)}
                                    className="group cursor-pointer flex flex-col bg-[#141414] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-[4/5] w-full bg-[#0D0D0D] relative flex items-center justify-center overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={(e) => handleToggleFavorito(e, perfume.id)}
                                            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-zinc-700 hover:bg-black/80 hover:scale-110 transition-all duration-300"
                                            aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                            aria-pressed={favorito}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className={`w-3.5 h-3.5 transition-colors duration-300 ${
                                                    favorito ? "fill-white text-white" : "fill-transparent text-zinc-400"
                                                }`}
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

                                        {perfume.imagemUrl ? (
                                            // unoptimized: evita liberar o domínio no next.config.
                                            // Com images.remotePatterns configurado, pode remover.
                                            <Image
                                                src={perfume.imagemUrl}
                                                alt={perfume.nome}
                                                fill
                                                unoptimized
                                                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <span className="text-[10px] tracking-widest uppercase text-zinc-700">
                                                Sem Imagem
                                            </span>
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

                                        <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-zinc-500 text-[11px]">
                                                <span>De:</span>
                                                <span className="line-through whitespace-nowrap">
                                                    R$ {formatarPreco(perfume.preco)}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                                                    À vista ({PERCENTUAL_DESCONTO}% OFF)
                                                </span>
                                                <span className="text-base font-bold text-white whitespace-nowrap">
                                                    R$ {formatarPreco(precoAVista(perfume.preco))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-800 bg-[#0A0A0A] py-16 mt-12 text-zinc-400">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="space-y-4">
                        <span className="text-lg font-bold tracking-wide text-white">M. COSMÉTICOS</span>
                        <p className="text-sm font-light leading-relaxed text-zinc-500">
                            Haute Parfumerie. Fragrâncias raras e atemporais desenvolvidas para marcar presença
                            com distinção e sofisticação inconfundível.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Navegação</h4>
                        <ul className="space-y-2 text-sm font-light text-zinc-400">
                            <li><Link href="/vitrine" className="hover:text-white transition-colors">Vitrine Exclusiva</Link></li>
                            <li><Link href="/favoritos" className="hover:text-white transition-colors">Meus Favoritos</Link></li>
                            <li><Link href="/perfil" className="hover:text-white transition-colors">Minha Conta</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Atendimento</h4>
                        <p className="text-sm font-light leading-relaxed text-zinc-500">
                            Suporte exclusivo via e-mail e canais oficiais.
                        </p>
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
