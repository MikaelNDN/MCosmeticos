"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import Image from "next/image";

export default function CadastrarAdminPage() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [cidade, setCidade] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro("");

        try {
            await api.post("/api/usuarios/cadastro", {
                nome,
                sobrenome,
                dataNascimento,
                email,
                senha
            });

            alert("Usuário cadastrado com sucesso!");
            router.push("/login");
        } catch (err: unknown) {
            console.error("Erro no cadastro:", err);
            setErro("Não foi possível realizar o cadastro. Verifique os campos ou se o e-mail já existe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans grid grid-cols-1 lg:grid-cols-2 selection:bg-white selection:text-black">

            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0D0D0D] border-r border-zinc-800/80 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-45">
                    <Image
                        src="/banner2.jpeg"
                        alt="Banner M. Cosméticos"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/60" />
                </div>

                <div className="relative z-10">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold cursor-pointer" onClick={() => router.push("/")}>
                        M. COSMÉTICOS
                    </span>
                </div>

                <div className="relative z-10 max-w-md space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
                        A essência da sofisticação em cada nota olfativa.
                    </h2>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Crie sua conta para gerenciar pedidos, favoritos e explorar coleções exclusivas com total praticidade e segurança.
                    </p>
                </div>

                <div className="relative z-10 text-[10px] uppercase tracking-widest text-zinc-600">
                    Secure Portal &bull; 2026
                </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-lg space-y-6 bg-[#141414] border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-2xl my-auto">

                    <div className="space-y-1">
                        <button
                            onClick={() => router.push("/login")}
                            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-2 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>&larr; Voltar ao Login</span>
                        </button>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">New User</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Criar Credencial</h1>
                        <p className="text-xs text-zinc-400 font-light">Preencha os dados do novo Usuário.</p>
                    </div>

                    {erro && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-light text-center rounded-lg">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleCadastro} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Nome</label>
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="..."
                                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Sobrenome</label>
                                <input
                                    type="text"
                                    required
                                    value={sobrenome}
                                    onChange={(e) => setSobrenome(e.target.value)}
                                    placeholder="..."
                                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Nascimento</label>
                                <input
                                    type="date"
                                    value={dataNascimento}
                                    onChange={(e) => setDataNascimento(e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-zinc-400"
                                />
                            </div>

                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@gmail.com"
                                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Senha</label>
                            <input
                                type="password"
                                required
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg disabled:opacity-50 mt-2 cursor-pointer"
                        >
                            {loading ? "Cadastrando..." : "Registrar Acesso"}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-zinc-800/60">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-light">
                            &copy; 2026 M. Cosméticos. Secure Portal.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}