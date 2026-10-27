"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/services/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const LISTA_URL = "/admin";

const inputClass =
    "bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all w-full text-white placeholder:text-zinc-600";
const labelClass =
    "block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold";

export default function NovoPerfumePage() {
    useAuthGuard(true); // Proteção de rota padronizada
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const [formData, setFormData] = useState({
        nome: "",
        marca: "",
        linha: "",
        descricao: "",
        preco: "",
        estoque: "",
    });
    const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // Preview da imagem selecionada (com limpeza da URL temporária)
    useEffect(() => {
        if (!imagemArquivo) {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(imagemArquivo);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imagemArquivo]);

    // Volta para a página anterior (a listagem); sem histórico, usa a rota de reserva
    const voltarParaLista = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(LISTA_URL);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImagemArquivo(e.target.files?.[0] ?? null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // evita envio duplicado
        setLoading(true);
        setErro("");

        try {
            const data = new FormData();
            data.append("nome", formData.nome);
            data.append("marca", formData.marca);
            data.append("descricao", formData.descricao);

            // Garante que o preço vá com ponto (ex: 150.50) e os números sejam válidos
            data.append("preco", String(Number(formData.preco.replace(",", "."))));
            data.append("estoque", String(Number(formData.estoque)));

            // Só anexa a linha se ela não estiver vazia
            if (formData.linha.trim() !== "") {
                data.append("linha", formData.linha.trim());
            }

            // O Java espera @RequestParam(value = "imagem")
            if (imagemArquivo) {
                data.append("imagem", imagemArquivo);
            }

            // Sem header manual: o axios/navegador define o Content-Type com o boundary correto
            await api.post("/api/perfumes", data);

            // Sucesso: mantém o botão desabilitado até a navegação terminar
            router.push(LISTA_URL);
        } catch (error: unknown) {
            console.error(
                "Erro do backend:",
                axios.isAxiosError(error) ? error.response?.data ?? error : error
            );
            setErro("Ocorreu um erro ao salvar. Verifique se os dados estão corretos.");
            setLoading(false);
        }
    };

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
                        onClick={voltarParaLista}
                        className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2"
                    >
                        <span>&larr; Voltar</span>
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Adicionar Fragrância</h1>
                    <p className="text-sm text-zinc-400 mt-2 tracking-wide">
                        Preencha os detalhes e selecione a imagem do produto para upload.
                    </p>
                </div>

                {erro && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-xs tracking-wide text-red-300"
                    >
                        <span>{erro}</span>
                        <button
                            type="button"
                            onClick={() => setErro("")}
                            className="text-red-400 hover:text-white transition-colors"
                            aria-label="Fechar aviso"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="bg-[#141414] border border-zinc-800 p-8 rounded-2xl shadow-2xl space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Nome da Fragrância *</label>
                            <input
                                type="text"
                                name="nome"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Ex: Essencial Oud"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Marca *</label>
                            <input
                                type="text"
                                name="marca"
                                required
                                value={formData.marca}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Ex: Natura"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Linha (Opcional)</label>
                            <input
                                type="text"
                                name="linha"
                                value={formData.linha}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Ex: Essencial"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Imagem do Produto (Upload)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="bg-[#0A0A0A] border border-zinc-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-zinc-500 transition-all w-full text-zinc-400 file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-md file:text-[10px] file:uppercase file:tracking-widest file:bg-zinc-800 file:text-white file:cursor-pointer hover:file:bg-zinc-700"
                            />

                            {previewUrl && (
                                <div className="mt-3 flex items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Pré-visualização da imagem"
                                        className="h-20 w-20 rounded-lg border border-zinc-800 object-cover bg-[#0A0A0A]"
                                    />
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                                        Imagem selecionada
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Preço (R$) *</label>
                            <input
                                type="number"
                                name="preco"
                                step="0.01"
                                min="0"
                                required
                                value={formData.preco}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Estoque *</label>
                            <input
                                type="number"
                                name="estoque"
                                min="0"
                                required
                                value={formData.estoque}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Quantidade"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Descrição *</label>
                        <textarea
                            name="descricao"
                            required
                            rows={4}
                            value={formData.descricao}
                            onChange={handleChange}
                            className={`${inputClass} resize-none`}
                            placeholder="Descreva as notas olfativas e a essência do perfume..."
                        ></textarea>
                    </div>

                    <div className="pt-6 border-t border-zinc-800/50 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={voltarParaLista}
                            className="text-xs uppercase tracking-widest px-6 py-3 text-zinc-400 hover:text-white transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Salvando..." : "Salvar Fragrância"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
