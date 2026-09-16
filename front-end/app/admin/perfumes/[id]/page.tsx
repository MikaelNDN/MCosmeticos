"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditarPerfumePage({ params }: PageProps) {
    useAuthGuard(true); // Bloqueia e expulsa quem não for ADMIN
    const resolvedParams = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        marca: "",
        linha: "",
        descricao: "",
        preco: "",
        estoque: "",
    });
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const [imagemAtualUrl, setImagemAtualUrl] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function carregarPerfume() {
            try {
                const response = await api.get(`/api/perfumes/${resolvedParams.id}`);
                if (isMounted && response.data) {
                    const p = response.data;
                    setFormData({
                        nome: p.nome || "",
                        marca: p.marca || "",
                        linha: p.linha || "",
                        descricao: p.descricao || "",
                        preco: p.preco !== undefined ? String(p.preco) : "",
                        estoque: p.estoque !== undefined ? String(p.estoque) : "",
                    });
                    setImagemAtualUrl(p.imagemUrl || "");
                }
            } catch (error) {
                console.error("Erro ao carregar perfume para edição:", error);
                alert("Não foi possível carregar os dados da fragrância.");
                router.push("/admin/perfumes");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (resolvedParams.id) {
            carregarPerfume();
        }

        return () => { isMounted = false; };
    }, [resolvedParams.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImagemArquivo(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSalvando(true);
        try {
            const data = new FormData();
            data.append("nome", formData.nome);
            data.append("marca", formData.marca);
            data.append("linha", formData.linha);
            data.append("descricao", formData.descricao);
            data.append("preco", formData.preco);
            data.append("estoque", formData.estoque);

            if (imagemArquivo) {
                data.append("imagem", imagemArquivo);
            }

            await api.put(`/api/perfumes/${resolvedParams.id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            router.refresh();
            router.push("/admin/perfumes");
        } catch (error) {
            console.error("Erro ao atualizar fragrância:", error);
            alert("Ocorreu um erro ao atualizar. Verifique os dados.");
            setSalvando(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-xs uppercase tracking-widest text-zinc-500 animate-pulse font-sans">
                Carregando essência...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-white selection:text-black">
            {/* Header Dark Mode */}
            <header className="border-b border-zinc-800 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <span className="text-xl font-bold tracking-wide text-white">
                        ADMIN <span className="text-zinc-500 font-light">| M. COSMÉTICOS</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => router.push("/admin/perfumes")}
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                    >
                        <span>&larr; Voltar</span>
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Editar Fragrância</h1>
                    <p className="text-sm text-zinc-400 mt-2 tracking-wide">
                        Atualize as informações e detalhes do produto no catálogo.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#141414] border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Nome da Fragrância *</label>
                            <input
                                type="text"
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Marca *</label>
                            <input
                                type="text"
                                name="marca"
                                required
                                value={formData.marca}
                                onChange={handleChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Linha (Opcional)</label>
                            <input
                                type="text"
                                name="linha"
                                value={formData.linha}
                                onChange={handleChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Nova Imagem (Opcional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-zinc-500 transition-all w-full text-zinc-400 file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-md file:text-[10px] file:uppercase file:tracking-widest file:bg-zinc-800 file:text-white file:cursor-pointer hover:file:bg-zinc-700"
                            />
                            {imagemAtualUrl && !imagemArquivo && (
                                <p className="text-[10px] text-zinc-500 mt-2">Mantendo a imagem atual cadastrada.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Preço (R$) *</label>
                            <input
                                type="number"
                                name="preco"
                                step="0.01"
                                min="0"
                                required
                                value={formData.preco}
                                onChange={handleChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Estoque *</label>
                            <input
                                type="number"
                                name="estoque"
                                min="0"
                                required
                                value={formData.estoque}
                                onChange={handleChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">Descrição *</label>
                        <textarea
                            name="descricao"
                            required
                            rows={4}
                            value={formData.descricao}
                            onChange={handleChange}
                            className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600 resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/admin/perfumes")}
                            className="text-xs uppercase tracking-widest px-6 py-3 text-zinc-400 hover:text-white transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={salvando}
                            className="bg-white text-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {salvando ? "Atualizando..." : "Atualizar Fragrância"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}