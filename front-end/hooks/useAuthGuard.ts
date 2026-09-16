import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard(requerAdmin = false) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token) {
            router.replace("/login");
            return;
        }

        if (requerAdmin && role?.toUpperCase() !== "ADMIN") {
            router.replace("/vitrine");
        }
    }, [router, requerAdmin]);
}