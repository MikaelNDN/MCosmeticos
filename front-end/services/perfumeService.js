import api from './api';

export const perfumeService = {
    async listarPerfumes() {
        const response = await api.get('/api/perfumes'); // Ajuste a rota conforme o seu controller back-end
        return response.data;
    },

    async cadastrarPerfume(formData) {
        const response = await api.post('/api/perfumes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};