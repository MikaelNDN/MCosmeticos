"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Perfume {
    id: string;
    nome: string;
    marca: string;
    linha: string;
    preco: number;
    estoque: number;
}


const TAMANHO_PAGINA = 200;

const headerBtnClass =
    "text-[11px] sm:text-xs uppercase tracking-widest transition-colors font-medium cursor-pointer";

export default function AdminPerfumesPage() {
    useAuthGuard(true); // o backend também precisa exigir ADMIN nas rotas de escrita

    const router = useRouter();

    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    const [termoBusca, setTermoBusca] = useState(""); // o que está digitado
    const [termoAplicado, setTermoAplicado] = useState(""); // o que filtrou a lista
    const [excluindoId, setExcluindoId] = useState<string | null>(null);

    const carregarCatalogo = useCallback(async (nome = "") => {
        setLoading(true);
        setErro("");
        try {
            const params = new URLSearchParams({ size: String(TAMANHO_PAGINA) });
            if (nome) params.append("nome", nome);

            const { data } = await api.get(`/api/perfumes?${params.toString()}`);
            const lista = data?.content ?? data;

            setPerfumes(Array.isArray(lista) ? lista : []);
            setTermoAplicado(nome);
        } catch (error) {
            console.error("Erro ao carregar admin:", error);
            setPerfumes([]);
            setErro("Não foi possível carregar o catálogo.");
            toast.error("Falha ao carregar", {
                description: "Verifique sua conexão e tente novamente.",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarCatalogo();
    }, [carregarCatalogo]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        carregarCatalogo(termoBusca.trim());
    };

    const handleSair = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.replace("/login");
    };

    const handleDelete = async (id: string) => {
        if (excluindoId) return; // evita clique duplo

        setExcluindoId(id);
        try {
            await api.delete(`/api/perfumes/${id}`);

            toast.success("Perfume excluído", {
                description: "A fragrância foi removida do catálogo com sucesso.",
            });

            carregarCatalogo(termoAplicado); // mantém o filtro atual
        } catch (error) {
            console.error("Erro ao excluir:", error);

            toast.error("Falha na exclusão", {
                description: "Não foi possível remover o perfume. Verifique sua conexão ou tente novamente.",
            });
        } finally {
            setExcluindoId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-white selection:text-black">
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between">
                    <span className="text-xs sm:text-xl font-bold tracking-wide text-white whitespace-nowrap">
                        ADMIN <span className="text-zinc-500 font-light">| M. COSMÉTICOS</span>
                    </span>

                    <nav className="flex items-center gap-3 sm:gap-6">
                        <Link href="/vitrine" className={`${headerBtnClass} text-zinc-400 hover:text-white`}>
                            Vitrine
                        </Link>
                        <button
                            type="button"
                            onClick={handleSair}
                            className={`${headerBtnClass} text-red-400 hover:text-red-300 border-l border-zinc-700 pl-3 sm:pl-6`}
                        >
                            Sair
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciar Fragrâncias</h1>

                    <Link
                        href="/admin/perfumes/novo"
                        className="bg-white text-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg"
                    >
                        + Nova Fragrância
                    </Link>
                </div>

                <div className="bg-[#141414] border border-zinc-800 p-4 rounded-xl shadow-2xl mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            aria-label="Buscar por nome"
                            className="bg-[#0A0A0A] border border-zinc-800 focus:border-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white flex-1 w-full"
                        />
                        <button
                            type="submit"
                            className="bg-zinc-800 text-white text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-zinc-700 transition-colors font-bold w-full sm:w-auto cursor-pointer"
                        >
                            Buscar
                        </button>
                        {termoAplicado && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTermoBusca("");
                                    carregarCatalogo();
                                }}
                                className="text-[10px] uppercase tracking-widest px-4 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Limpar
                            </button>
                        )}
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
                        Carregando dados...
                    </div>
                ) : erro ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <p className="text-sm text-red-400 mb-6">{erro}</p>
                        <button
                            type="button"
                            onClick={() => carregarCatalogo(termoAplicado)}
                            className="text-xs uppercase tracking-widest bg-zinc-800 text-white px-6 py-3 rounded-lg hover:bg-zinc-700 transition-colors cursor-pointer"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#141414] border border-zinc-800 rounded-2xl shadow-2xl overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th scope="col" className="px-6 py-5 font-semibold">Nome</th>
                                <th scope="col" className="px-6 py-5 font-semibold">Marca</th>
                                <th scope="col" className="px-6 py-5 font-semibold">Linha</th>
                                <th scope="col" className="px-6 py-5 font-semibold">Preço (R$)</th>
                                <th scope="col" className="px-6 py-5 font-semibold">Estoque</th>
                                <th scope="col" className="px-6 py-5 font-semibold text-right">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                            {perfumes.map((perfume) => (
                                <tr key={perfume.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 text-zinc-100 font-medium">{perfume.nome}</td>
                                    <td className="px-6 py-4 text-zinc-400">{perfume.marca}</td>
                                    <td className="px-6 py-4 text-zinc-400">{perfume.linha || "-"}</td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {Number(perfume.preco).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                                                    perfume.estoque > 0
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}
                                            >
                                                {perfume.estoque} un.
                                            </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end items-center gap-5">
                                            <Link
                                                href={`/admin/perfumes/${perfume.id}`}
                                                aria-label={`Editar ${perfume.nome}`}
                                                className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white font-medium transition-colors"
                                            >
                                                Editar
                                            </Link>

                                            <AlertDialog>
                                                <AlertDialogTrigger
                                                    aria-label={`Excluir ${perfume.nome}`}
                                                    disabled={excluindoId === perfume.id}
                                                    className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {excluindoId === perfume.id ? "Excluindo..." : "Excluir"}
                                                </AlertDialogTrigger>

                                                <AlertDialogContent className="bg-[#141414] border-zinc-800 text-white sm:rounded-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-xl">
                                                            Tem certeza absoluta?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-zinc-400">
                                                            Esta ação não pode ser desfeita. Isso excluirá
                                                            permanentemente a fragrância{" "}
                                                            <strong className="text-zinc-200">{perfume.nome}</strong> do
                                                            banco de dados.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-4">
                                                        <AlertDialogCancel className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800 cursor-pointer rounded-lg">
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(perfume.id)}
                                                            className="bg-red-600/90 text-white hover:bg-red-700 cursor-pointer rounded-lg"
                                                        >
                                                            Sim, excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {perfumes.length === 0 && (
                            <div className="text-center py-12 text-zinc-500 text-sm font-light">
                                {termoAplicado
                                    ? "Nenhum perfume encontrado para essa busca."
                                    : "Nenhum perfume cadastrado no catálogo."}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
