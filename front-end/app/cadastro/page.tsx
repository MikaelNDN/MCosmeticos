"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "@/services/api";

const TAMANHO_MINIMO_SENHA = 6; // se o backend exigir mais, ajuste aqui

const hojeLocal = () => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mes}-${dia}`;
};

const labelClass = "block text-[10px] uppercase tracking-widest text-zinc-500 mb-1 font-semibold";
const inputClass =
    "w-full bg-[#0A0A0A] border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-all text-white placeholder:text-zinc-600";


function IconeOlho({ aberto }: { aberto: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
        >
            {aberto ? (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
            ) : (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
            )}
        </svg>
    );
}

interface CampoSenhaProps {
    id: string;
    label: string;
    value: string;
    onChange: (valor: string) => void;
    autoComplete: string;
}

function CampoSenha({ id, label, value, onChange, autoComplete }: CampoSenhaProps) {
    const [mostrar, setMostrar] = useState(false);

    return (
        <div>
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={mostrar ? "text" : "password"}
                    required
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                />
                <button
                    type="button"
                    onClick={() => setMostrar((v) => !v)}
                    aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={mostrar}
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <IconeOlho aberto={mostrar} />
                </button>
            </div>
        </div>
    );
}

function Requisito({ ok, texto }: { ok: boolean; texto: string }) {
    return (
        <p
            className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                ok ? "text-emerald-500" : "text-zinc-600"
            }`}
        >
            {ok ? "✓" : "○"} {texto}
        </p>
    );
}

export default function CadastroPage() {
    const router = useRouter();

    const [nome, setNome] = useState("");
    const [sobrenome, setSobrenome] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");


    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /[0-9]/.test(senha);
    const tamanhoValido = senha.length >= TAMANHO_MINIMO_SENHA;
    const senhaTotalmenteValida = temMaiuscula && temNumero && tamanhoValido;
    const senhasCoincidem = senha === confirmarSenha && confirmarSenha.length > 0;

    const dataMaxima = hojeLocal();
    const dataMinima = "1900-01-01";

    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        if (!senhasCoincidem) {
            setErro("As senhas não coincidem. Digite novamente.");
            return;
        }

        if (!senhaTotalmenteValida) {
            setErro("A senha não atende aos requisitos mínimos de segurança.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/usuarios/cadastro", {
                nome: nome.trim(),
                sobrenome: sobrenome.trim(),
                dataNascimento,
                email: email.trim().toLowerCase(), // mesmo formato usado no login
                senha,
            });

            toast.success("Cadastro realizado com sucesso!", {
                description: "Faça login para continuar.",
            });
            router.replace("/login");
        } catch (err) {
            console.error("Erro no cadastro:", err);

            const status = isAxiosError(err) ? err.response?.status : undefined;

            setErro(
                status === 409
                    ? "Este e-mail já está cadastrado."
                    : status === 400
                        ? "Verifique os campos preenchidos e tente novamente."
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
                        A essência da sofisticação em cada nota olfativa.
                    </h2>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">
                        Crie sua conta para gerenciar pedidos, favoritos e explorar coleções exclusivas
                        com total praticidade e segurança.
                    </p>
                </div>

                <div className="relative z-10 text-[10px] uppercase tracking-widest text-zinc-600">
                    Secure Portal &bull; 2026
                </div>
            </div>

            {/* Formulário */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
                <div className="w-full max-w-lg space-y-6 bg-[#141414] border border-zinc-800 p-6 sm:p-10 rounded-2xl shadow-2xl my-auto">
                    <div className="space-y-1">
                        <Link
                            href="/login"
                            className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-2 inline-block"
                        >
                            &larr; Voltar ao Login
                        </Link>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold block">
                            Novo Cliente
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Criar Conta</h1>
                        <p className="text-xs text-zinc-400 font-light">
                            Preencha seus dados para se cadastrar.
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

                    <form onSubmit={handleCadastro} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="nome" className={labelClass}>
                                    Nome
                                </label>
                                <input
                                    id="nome"
                                    type="text"
                                    required
                                    autoComplete="given-name"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="..."
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="sobrenome" className={labelClass}>
                                    Sobrenome
                                </label>
                                <input
                                    id="sobrenome"
                                    type="text"
                                    required
                                    autoComplete="family-name"
                                    value={sobrenome}
                                    onChange={(e) => setSobrenome(e.target.value)}
                                    placeholder="..."
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="nascimento" className={labelClass}>
                                Data de Nascimento
                            </label>
                            <input
                                id="nascimento"
                                type="date"
                                required
                                autoComplete="bday"
                                max={dataMaxima}
                                min={dataMinima}
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                                className={`${inputClass} text-zinc-400`}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="usuario@gmail.com"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <CampoSenha
                                    id="senha"
                                    label="Senha"
                                    value={senha}
                                    onChange={setSenha}
                                    autoComplete="new-password"
                                />
                                <div className="mt-2 space-y-1">
                                    <Requisito ok={tamanhoValido} texto={`Mín. ${TAMANHO_MINIMO_SENHA} caracteres`} />
                                    <Requisito ok={temMaiuscula} texto="1 Maiúscula" />
                                    <Requisito ok={temNumero} texto="1 Número" />
                                </div>
                            </div>

                            <div>
                                <CampoSenha
                                    id="confirmar-senha"
                                    label="Confirmar Senha"
                                    value={confirmarSenha}
                                    onChange={setConfirmarSenha}
                                    autoComplete="new-password"
                                />
                                {confirmarSenha.length > 0 && (
                                    <p
                                        className={`mt-2 text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                                            senhasCoincidem ? "text-emerald-500" : "text-red-400"
                                        }`}
                                    >
                                        {senhasCoincidem ? "✓ Senhas coincidem" : "✗ Senhas divergentes"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !senhaTotalmenteValida || !senhasCoincidem}
                            className="w-full bg-white text-black text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-zinc-200 transition-colors font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
                        >
                            {loading ? "Cadastrando..." : "Criar Conta"}
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
