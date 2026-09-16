export interface Perfume {
    id: string;
    nome: string;
    marca: string;
    preco: number;
    descricao?: string;
    imageUrl?: string;
}

export interface PagePerfume {
    content: Perfume[];
    totalPages: number;
    totalElements: number;
}