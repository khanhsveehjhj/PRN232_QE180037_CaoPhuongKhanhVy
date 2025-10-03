'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react';
import { Product } from '@/lib/types';
import { productService } from '@/lib/services/productService';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);

    const productId = parseInt(params.id as string);

    const loadProduct = useCallback(async () => {
        try {
            setLoading(true);
            const productData = await productService.getProductById(productId);
            setProduct(productData);
            setError(null);
        } catch (err) {
            setError('Không thể tải thông tin sản phẩm');
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId && !isNaN(productId)) {
            loadProduct();
        }
    }, [productId, loadProduct]);

    const handleDelete = async () => {
        try {
            await productService.deleteProduct(productId);
            router.push('/');
        } catch (err) {
            setError('Không thể xóa sản phẩm');
            console.error('Error deleting product:', err);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="max-w-md mx-auto text-center px-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <Package className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Có lỗi xảy ra</h3>
                        <p className="text-red-600 mb-4 text-sm">{error}</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="max-w-md mx-auto text-center px-4">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Không tìm thấy sản phẩm</h3>
                        <p className="text-gray-600 mb-4 text-sm">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="w-full">
                {/* Page Title */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Chi tiết sản phẩm</h1>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 pb-6 gap-4">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Link>

                    <div className="flex gap-2">
                        <Link
                            href={`/products/${product.id}/edit`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Link>

                        <button
                            onClick={() => setDeleteModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </button>
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full">
                    <div>
                        <div className="lg:flex">
                            {/* Product Image */}
                            <div className="lg:w-1/2">
                                <div className="relative h-64 md:h-80 lg:h-96 bg-gray-100">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <Package className="h-12 w-12 text-gray-400 mb-2" />
                                            <p className="text-gray-500 text-sm font-medium">Chưa có hình ảnh</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="lg:w-1/2 p-8 lg:p-10">
                                <div className="space-y-6">
                                    {/* Product Title */}
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-4">
                                            ID: {product.id}
                                        </span>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                            {product.name}
                                        </h1>
                                    </div>

                                    {/* Price */}
                                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                                        <p className="text-sm text-green-700 mb-2 font-medium">Giá bán</p>
                                        <span className="text-3xl font-bold text-green-600">
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                            <div className="w-1 h-5 bg-blue-600 rounded-full mr-3"></div>
                                            Mô tả sản phẩm
                                        </h3>
                                        <div className="bg-gray-50 p-6 rounded-xl">
                                            <p className="text-gray-700 leading-relaxed text-lg">
                                                {product.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons (Mobile) */}
                                    <div className="flex gap-3 lg:hidden pt-4">
                                        <Link
                                            href={`/products/${product.id}/edit`}
                                            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Chỉnh sửa
                                        </Link>

                                        <button
                                            onClick={() => setDeleteModal(true)}
                                            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModal && product && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
                            <div className="text-center">
                                {/* Warning Icon */}
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <Trash2 className="h-6 w-6 text-red-600" />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    Xác nhận xóa sản phẩm
                                </h3>

                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    Bạn có chắc chắn muốn xóa sản phẩm{' '}
                                    <span className="font-medium text-gray-900">&ldquo;{product.name}&rdquo;</span>?
                                    <br />
                                    <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
                                </p>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setDeleteModal(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}