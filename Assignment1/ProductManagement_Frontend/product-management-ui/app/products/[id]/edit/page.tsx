'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, Save, Package } from 'lucide-react';
import { Product, UpdateProductRequest } from '@/lib/types';
import { productService } from '@/lib/services/productService';

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    const productId = parseInt(params.id as string);

    const [formData, setFormData] = useState<UpdateProductRequest>({
        name: '',
        description: '',
        price: 0,
        imageFile: undefined,
    });

    const [errors, setErrors] = useState<{
        name?: string;
        price?: string;
        description?: string;
    }>({});

    const loadProduct = useCallback(async () => {
        try {
            setLoadingProduct(true);
            const productData = await productService.getProductById(productId);
            setProduct(productData);

            // Pre-fill form with product data
            setFormData({
                name: productData.name,
                description: productData.description,
                price: productData.price,
            });

            if (productData.image) {
                setImagePreview(productData.image);
            }

            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin sản phẩm');
            console.error('Error loading product:', err);
        } finally {
            setLoadingProduct(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId && !isNaN(productId)) {
            loadProduct();
        }
    }, [productId, loadProduct]);

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên sản phẩm là bắt buộc';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả sản phẩm là bắt buộc';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'Giá sản phẩm phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value,
        }));

        // Clear error for this field
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setError('Vui lòng chọn file ảnh có định dạng PNG, JPG hoặc GIF');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                setError(`File ảnh quá lớn (${fileSizeMB}MB). Vui lòng chọn ảnh có kích thước nhỏ hơn hoặc bằng 5MB`);
                e.target.value = ''; // Reset input
                return;
            }

            // Clear any previous errors
            setError(null);

            setFormData(prev => ({
                ...prev,
                imageFile: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updatedProduct = await productService.updateProduct(productId, formData);
            router.push(`/products/${updatedProduct.id}`);
        } catch (err) {
            setError('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
            console.error('Error updating product:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
                <div className="mt-4">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
                    <p className="text-gray-600 mt-1">Cập nhật thông tin sản phẩm &ldquo;{product.name}&rdquo;</p>
                </div>
                <Link
                    href={`/products/${productId}`}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                {/* Product Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh sản phẩm
                    </label>
                    <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                            <div className="relative w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                ) : (
                                    <Package className="h-12 w-12 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Upload className="h-4 w-4 mr-2" />
                                {imagePreview ? 'Thay đổi hình ảnh' : 'Chọn hình ảnh'}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/gif"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                                PNG, JPG, GIF tối đa 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* Product Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Nhập tên sản phẩm"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                {/* Product Price */}
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Giá sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleInputChange}
                            min="0"
                            step="1000"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            VND
                        </span>
                    </div>
                    {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                </div>

                {/* Product Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Nhập mô tả chi tiết về sản phẩm"
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-5 w-5 mr-2" />
                        )}
                        {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>

                    <Link
                        href={`/products/${productId}`}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
}