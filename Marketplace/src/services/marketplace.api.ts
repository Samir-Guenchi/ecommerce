import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imagePath: string | null;
    category: string;
    stock: number;
    store: {
        id: number;
        name: string;
        domain: string;
        location: string;
    };
}

export interface SearchParams {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    wilaya?: string;
    page?: number;
    limit?: number;
}

export interface SearchResponse {
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const searchProducts = async (params: SearchParams): Promise<SearchResponse> => {
    const response = await axios.get(`${API_BASE_URL}/marketplace/search`, { params });
    return response.data;
};

export const getStores = async (params: { page?: number; limit?: number; wilaya?: string }) => {
    const response = await axios.get(`${API_BASE_URL}/marketplace/stores`, { params });
    return response.data;
};

export const getStoreByDomain = async (domain: string) => {
    const response = await axios.get(`${API_BASE_URL}/marketplace/stores/${domain}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await axios.get(`${API_BASE_URL}/marketplace/categories`);
    return response.data;
};

// Cart APIs
export const getCart = async (userId: number) => {
    const response = await axios.get(`${API_BASE_URL}/marketplace/cart`, {
        params: { userId },
    });
    return response.data;
};

export const addToCart = async (userId: number, productId: number, storeId: number, quantity: number = 1) => {
    const response = await axios.post(`${API_BASE_URL}/marketplace/cart`, {
        userId,
        productId,
        storeId,
        quantity,
    });
    return response.data;
};

export const removeFromCart = async (userId: number, itemId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/marketplace/cart/${itemId}`, {
        params: { userId },
    });
    return response.data;
};

export const updateCartItem = async (userId: number, itemId: string, quantity: number) => {
    const response = await axios.put(`${API_BASE_URL}/marketplace/cart/${itemId}`, {
        userId,
        quantity,
    });
    return response.data;
};
