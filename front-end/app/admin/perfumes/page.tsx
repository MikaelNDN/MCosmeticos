"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";
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

export default function AdminPerfumesPage() {
    useAuthGuard(true);
    const router = useRouter();
    const [perfumes, setPerfumes] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");
    const [carregandoId, setCarregandoId] = useState<string | null>(null);

    const carregarCatalogo = async (nome = "") => {
        setLoading(true);
        try {
            let url = "/api/perfumes";
            if (nome) {
                url += `?nome=${nome}`;
            }
            const response = await api.get(url);
            const dadosBrutos = response.data?.content ? response.data.content : response.data;
            const lista = Array.isArray(dadosBrutos) ? dadosBrutos : [];
            setPerfumes(lista);
        } catch (error) {
            console.error("Erro ao carregar admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        async function fetchInicial() {
            try {
                const response = await api.get("/api/perfumes");
                if (isMounted) {
                    const dadosBrutos = response.data?.content ? response.data.content : response.data;
                    const lista = Array.isArray(dadosBrutos) ? dadosBrutos : [];
                    setPerfumes(lista);
                }
            } catch (error) {
                console.error("Erro:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchInicial();
        return () => { isMounted = false; };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        carregarCatalogo(termoBusca);
    };

    // Função limpa: Só exclui. A pergunta de "Tem certeza?" ficou no HTML.
    const handleDelete = async (id: string) => {
        if (!id || id === "undefined" || typeof id !== "string") {
            toast.error("Erro de Validação", {
                description: "O ID do perfume está inválido ou vazio.",
            });
            return;
        }

        try {
            await api.delete(`/api/perfumes/${id}`);

            toast.success("Perfume excluído", {
                description: "A fragrância foi removida do catálogo com sucesso.",
            });

            carregarCatalogo();
        } catch (error) {
            console.error("Erro ao excluir:", error);

            toast.error("Falha na exclusão", {
                description: "Não foi possível remover o perfume. Verifique sua conexão ou tente novamente.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-white selection:text-black">
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <span className="text-xl font-bold tracking-wide text-white">
                        ADMIN <span className="text-zinc-500 font-light">| M. COSMÉTICOS</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => router.push("/vitrine")}
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2 cursor-pointer"
                    >
                        <span>Sair</span>
                        <span className="hidden sm:inline">(Ir para Vitrine)</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Gerenciar Fragrâncias</h1>

                    <button
                        type="button"
                        onClick={() => router.push("/admin/perfumes/novo")}
                        className="bg-white text-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg cursor-pointer"
                    >
                        + Nova Fragrância
                    </button>
                </div>

                <div className="bg-[#141414] border border-zinc-800 p-4 rounded-xl shadow-2xl mb-8">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="bg-[#0A0A0A] border border-zinc-800 focus:border-zinc-500 rounded-lg px-4 py-3 text-sm focus:outline-none transition-all placeholder:text-zinc-600 text-white flex-1 w-full"
                        />
                        <button type="submit" className="bg-zinc-800 text-white text-xs uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-zinc-700 transition-colors font-bold w-full sm:w-auto cursor-pointer">
                            Buscar
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-xs uppercase tracking-widest text-zinc-500 animate-pulse">
                        Carregando dados...
                    </div>
                ) : (
                    <div className="bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-5 font-semibold">Nome</th>
                                <th className="px-6 py-5 font-semibold">Marca</th>
                                <th className="px-6 py-5 font-semibold">Linha</th>
                                <th className="px-6 py-5 font-semibold">Preço (R$)</th>
                                <th className="px-6 py-5 font-semibold">Estoque</th>
                                <th className="px-6 py-5 font-semibold text-right">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                            {perfumes.map((perfume) => (
                                <tr key={perfume.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 text-zinc-100 font-medium">{perfume.nome}</td>
                                    <td className="px-6 py-4 text-zinc-400">{perfume.marca}</td>
                                    <td className="px-6 py-4 text-zinc-400">{perfume.linha || "-"}</td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        {Number(perfume.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                                            perfume.estoque > 0
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                        }`}>
                                            {perfume.estoque} un.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-5 flex justify-end items-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCarregandoId(perfume.id);
                                                router.push(`/admin/perfumes/${perfume.id}`);
                                            }}
                                            disabled={carregandoId === perfume.id}
                                            className="text-[10px] uppercase tracking-widest text-zinc-300 hover:text-white font-medium disabled:opacity-50 transition-colors cursor-pointer"
                                        >
                                            {carregandoId === perfume.id ? "Abrindo..." : "Editar"}
                                        </button>

                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer"
                                            >
                                                Excluir
                                            </AlertDialogTrigger>

                                            <AlertDialogContent className="bg-[#141414] border-zinc-800 text-white sm:rounded-2xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-xl">Tem certeza absoluta?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-zinc-400">
                                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a fragrância <strong className="text-zinc-200">{perfume.nome}</strong> do banco de dados.
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

                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {perfumes.length === 0 && (
                            <div className="text-center py-12 text-zinc-500 text-sm font-light">
                                Nenhum perfume encontrado no catálogo.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}