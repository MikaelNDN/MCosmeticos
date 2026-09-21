"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Image from "next/image";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        senha: ""
    });
    const [erro, setErro] = useState("");

    const parseJwt = (token: string) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/api/auth/login", form);
            const token = response.data;

            if (token) {
                localStorage.setItem("token", token);
                const decodedToken = parseJwt(token);
                const role = decodedToken?.role || decodedToken?.authorities?.[0] || "USER";
                localStorage.setItem("role", String(role).toUpperCase());

                toast.success("Login realizado com sucesso!", {
                    description: "Bem-vindo de volta à M. Cosméticos.",
                });

                if (String(role).toUpperCase().includes("ADMIN")) {
                    router.push("/admin");
                } else {
                    router.push("/vitrine");
                }
            }
        } catch (err: unknown) {
            console.error(err);
            setErro("E-mail ou senha inválidos. Tente novamente.");

            toast.error("Falha na autenticação", {
                description: "Verifique as suas credenciais e tente novamente.",
            });
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
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold cursor-pointer" onClick={() => router.push("/vitrine")}>
                        M. COSMÉTICOS
                    </span>
                </div>

                <div className="relative z-10 max-w-md space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight text-white leading-snug">
                        Bem-vindo de volta à sofisticação.
                    </h2>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Acesse sua conta para gerenciar seus pedidos, explorar coleções e acessar suas fragrâncias favoritas com total exclusividade.
                    </p>
                </div>

                <div className="relative z-10 text-[10px] uppercase tracking-widest text-zinc-600">
                    Secure Portal &bull; 2026
                </div>
            </div>


            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-6 bg-[#141414] border border-zinc-800 p-8 sm:p-10 rounded-2xl shadow-2xl my-auto">

                    <div className="space-y-1 mb-6">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">Acesso Seguro</span>
                        <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Acesse sua Conta</h1>
                        <p className="text-xs text-zinc-400 font-light">Insira suas credenciais para continuar.</p>
                    </div>

                    {erro && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-light text-center rounded-lg">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">E-mail</label>
                            <input
                                type="email"
                                placeholder="exemplo@email.com"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold">Senha</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={form.senha}
                                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                                className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white text-black py-3.5 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-zinc-200 transition-colors shadow-lg mt-2 cursor-pointer"
                        >
                            Entrar
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-zinc-800/60 text-center">
                        <p className="text-xs text-zinc-400 font-light">
                            Ainda não possui uma conta?{" "}
                            <span onClick={() => router.push("/cadastro")} className="underline cursor-pointer text-white font-medium hover:text-zinc-300 transition-colors">
                                Cadastre-se
                            </span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}