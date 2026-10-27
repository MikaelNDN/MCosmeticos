"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/services/api";

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

const extrairToken = (data: unknown): string | null => {
    if (typeof data === "string" && data) return data;
    if (data && typeof data === "object" && "token" in data) {
        const t = (data as { token?: unknown }).token;
        return typeof t === "string" && t ? t : null;
    }
    return null;
};

const extrairRole = (payload: Record<string, unknown> | null): string => {
    const bruto =
        payload?.role ??
        (Array.isArray(payload?.authorities) ? payload?.authorities[0] : undefined);

    const texto =
        typeof bruto === "string"
            ? bruto
            : bruto && typeof bruto === "object" && "authority" in bruto
                ? String((bruto as { authority: unknown }).authority)
                : "USER";

    return texto.toUpperCase().replace(/^ROLE_/, "");
};

const labelClass = "block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold";
const inputClass =
    "w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", senha: "" });
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);

    // Abrir a tela de login encerra qualquer sessão anterior. Assim, ao voltar
    // para a vitrine daqui, a pessoa não aparece logada (nem como admin) por
    // causa de um token/role antigo no navegador.
    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email: form.email.trim().toLowerCase(),
                senha: form.senha,
            });

            const token = extrairToken(response.data);

            if (!token) {
                console.error("Resposta de login sem token:", response.data);
                setErro("Não foi possível concluir o login. Tente novamente.");
                return;
            }

            const role = extrairRole(parseJwt(token));

            localStorage.setItem("token", token);
            localStorage.setItem("role", role); // apenas visual: o backend valida a permissão

            toast.success("Login realizado com sucesso!", {
                description: "Bem-vindo de volta à M. Cosméticos.",
            });

            router.replace(role === "ADMIN" ? "/admin" : "/vitrine");
        } catch (err) {
            console.error(err);

            const credenciaisInvalidas =
                isAxiosError(err) &&
                (err.response?.status === 401 || err.response?.status === 403);

            setErro(
                credenciaisInvalidas
                    ? "E-mail ou senha inválidos. Tente novamente."
                    : "Não foi possível conectar ao servidor. Tente novamente em instantes."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 font-sans grid grid-cols-1 lg:grid-cols-2 selection:bg-white selection:text-black">
            {/* Painel lateral (apenas telas grandes) */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0D0D0D] border-r border-zinc-800/80 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-45">
                    <Image
                        src="/banner2.jpeg"
                        alt="Banner M. Cosméticos"
                        fill
                        sizes="50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/60" />
                </div>

                <div className="relative z-10">
                    <Link
                        href="/vitrine"
                        className="text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors font-semibold"
                    >
                        M. COSMÉTICOS
                    </Link>
                </div>

                <div className="relative z-10 max-w-md space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
                        Bem-vindo de volta à sofisticação.
                    </h2>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Acesse sua conta para gerenciar seus pedidos, explorar coleções e acessar suas
                        fragrâncias favoritas com total exclusividade.
                    </p>
                </div>

                <div className="relative z-10 text-[10px] uppercase tracking-widest text-zinc-600">
                    Secure Portal &bull; 2026
                </div>
            </div>

            {/* Formulário */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-6 bg-[#141414] border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-2xl my-auto">
                    {/* Saída para a vitrine (única visível no mobile) */}
                    <Link
                        href="/vitrine"
                        className="text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-medium inline-block"
                    >
                        &larr; Voltar à Vitrine
                    </Link>

                    <div className="space-y-1 mb-6">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">
                            Acesso Seguro
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                            Acesse sua Conta
                        </h1>
                        <p className="text-xs text-zinc-400 font-light">
                            Insira suas credenciais para continuar.
                        </p>
                    </div>

                    {erro && (
                        <div
                            role="alert"
                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-light text-center rounded-lg"
                        >
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="email" className={labelClass}>
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="exemplo@email.com"
                                required
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="senha" className={labelClass}>
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="senha"
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    value={form.senha}
                                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                                    className={`${inputClass} pr-20`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha((v) => !v)}
                                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                    aria-pressed={mostrarSenha}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors font-semibold"
                                >
                                    {mostrarSenha ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-200 active:bg-zinc-300 transition-all shadow-lg mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation relative z-20 active:scale-[0.99]"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center">
                        <p className="text-xs text-zinc-400 font-light">
                            Ainda não possui uma conta?{" "}
                            <Link
                                href="/cadastro"
                                className="underline text-white font-medium hover:text-zinc-300 transition-colors"
                            >
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
