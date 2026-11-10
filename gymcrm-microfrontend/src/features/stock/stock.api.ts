import { api } from '../../shared/api/client';
import { Product, ProductInput } from '../../shared/api/types';

export const listProducts = () => api.get<Product[]>('/products?limit=100');
export const createProduct = (input: ProductInput) => api.post<Product>('/products', input);
export const updateProduct = (id: string, input: ProductInput) => api.put<Product>(`/products/${encodeURIComponent(id)}`, input);
export const deleteProduct = (id: string) => api.delete(`/products/${encodeURIComponent(id)}`);
