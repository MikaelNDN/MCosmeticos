import axios from "axios";

const api = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "https://mcosmeticos-api.onrender.com",
});

// Interceptor para enviar o token JWT
// automaticamente em todas as requisições.
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;