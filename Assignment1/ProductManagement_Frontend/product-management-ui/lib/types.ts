export interface Product {
    id: number; // Changed from string to number
    name: string;
    description: string; // Changed from optional to required
    price: number;
    image?: string; // Changed from imageUrl to image
}

export interface CreateProductRequest {
    name: string;
    description: string; // Changed from optional to required
    price: number;
    imageFile?: File;
    imageUrl?: string; // Backend also supports imageUrl
}

export interface UpdateProductRequest {
    name: string;
    description: string; // Changed from optional to required
    price: number;
    imageFile?: File;
    imageUrl?: string; // Backend also supports imageUrl
}

// Simplified since backend doesn't support pagination
export interface ProductsResponse {
    products: Product[];
}