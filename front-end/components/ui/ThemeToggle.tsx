"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 transition-all duration-200 flex items-center justify-center cursor-pointer"
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-amber-300/90 transition-transform duration-300 hover:rotate-45" />
            ) : (
                <Moon className="w-4 h-4 text-zinc-600 transition-transform duration-300 hover:-rotate-12" />
            )}
        </button>
    );
}