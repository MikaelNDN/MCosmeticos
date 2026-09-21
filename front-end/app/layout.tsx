import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "M. Cosméticos | Catálogo",
    description: "Catálogo digital de perfumes e cosméticos",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body className="bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
        </body>
        </html>
    );
}