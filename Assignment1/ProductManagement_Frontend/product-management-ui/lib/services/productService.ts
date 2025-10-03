import { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7158/api';

class ProductService {
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        return response.json();
    }

    // Simplified since backend doesn't support pagination/search
    async getAllProducts(): Promise<Product[]> {
        const response = await fetch(`${API_BASE_URL}/products`);
        return this.handleResponse<Product[]>(response);
    }

    async getProductById(id: number): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        return this.handleResponse<Product>(response);
    }

    async createProduct(product: CreateProductRequest): Promise<Product> {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price.toString());

        if (product.imageFile) {
            formData.append('imageFile', product.imageFile);
        } else if (product.imageUrl) {
            formData.append('imageUrl', product.imageUrl);
        }

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            body: formData,
        });

        return this.handleResponse<Product>(response);
    }

    async updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price.toString());

        if (product.imageFile) {
            formData.append('imageFile', product.imageFile);
        } else if (product.imageUrl) {
            formData.append('imageUrl', product.imageUrl);
        }

        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            body: formData,
        });

        return this.handleResponse<Product>(response);
    }

    async deleteProduct(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
    }
}

export const productService = new ProductService();