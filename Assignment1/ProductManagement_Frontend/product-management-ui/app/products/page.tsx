'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Edit, Trash2, Eye, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { productService } from '@/lib/services/productService';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [priceFilter, setPriceFilter] = useState({ min: 0, max: 100000000 }); // Price range: 0 - 100M VND
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'price-desc' | 'newest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // 10 products per page
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
        isOpen: false,
        product: null,
    });

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const productList = await productService.getAllProducts();
            setProducts(productList);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách sản phẩm');
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Initialize filteredProducts when products are loaded
    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    // Client-side filtering and sorting
    useEffect(() => {
        const filtered = products.filter(product => {
            // Text search
            const matchesSearch = search.trim() === '' ||
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase());

            // Price filter
            const matchesPrice = product.price >= priceFilter.min && product.price <= priceFilter.max;

            return matchesSearch && matchesPrice;
        });

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'newest':
                    return b.id - a.id; // Assuming higher ID means newer
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [search, priceFilter, sortBy, products]);

    // Pagination - always show pagination based on all products (or filtered if there are filters)
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    }, [filteredProducts, currentPage, itemsPerPage]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await productService.deleteProduct(id);
            setDeleteModal({ isOpen: false, product: null });
            loadProducts();
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

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Custom CSS for dual range slider */}
            <style jsx>{`
        .dual-range-slider {
          position: relative;
          height: 40px;
          display: flex;
          align-items: center;
        }
        
        .slider-track {
          position: absolute;
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          z-index: 1;
        }
        
        .slider-range {
          position: absolute;
          height: 6px;
          background: #3b82f6;
          border-radius: 3px;
          z-index: 2;
        }
        
        .slider {
          position: absolute;
          width: 100%;
          height: 6px;
          background: transparent;
          appearance: none;
          pointer-events: none;
          z-index: 3;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: all;
          position: relative;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          pointer-events: all;
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
          border: none;
        }
        
        .slider-min {
          z-index: 4;
        }
        
        .slider-max {
          z-index: 5;
        }
      `}</style>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                    <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm của bạn</p>
                </div>
                <Link
                    href="/products/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex gap-3 items-center">
                    {/* Search Bar */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative" ref={filterDropdownRef}>
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center justify-center w-12 h-12 rounded-lg border transition-colors ${showFilterDropdown
                                ? 'bg-blue-50 border-blue-300 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            title="Bộ lọc"
                        >
                            <Filter className="h-5 w-5" />
                        </button>

                        {/* Filter Dropdown Content */}
                        {showFilterDropdown && (
                            <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-6 space-y-6">
                                {/* Price Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">
                                        Khoảng giá
                                    </label>

                                    {/* Price Display */}
                                    <div className="flex justify-center mb-4">
                                        <div className="flex gap-4">
                                            <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                                                {formatPrice(priceFilter.min)}
                                            </div>
                                            <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
                                                {formatPrice(priceFilter.max)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dual Range Slider */}
                                    <div className="relative">
                                        <div className="dual-range-slider">
                                            {/* Background track */}
                                            <div className="slider-track"></div>

                                            {/* Selected range */}
                                            <div
                                                className="slider-range"
                                                style={{
                                                    left: `${(priceFilter.min / 100000000) * 100}%`,
                                                    width: `${((priceFilter.max - priceFilter.min) / 100000000) * 100}%`
                                                }}
                                            ></div>

                                            {/* Min slider */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="100000000"
                                                step="1000000"
                                                value={priceFilter.min}
                                                onChange={(e) => {
                                                    const newMin = parseInt(e.target.value);
                                                    setPriceFilter(prev => ({
                                                        ...prev,
                                                        min: Math.min(newMin, prev.max - 1000000)
                                                    }));
                                                }}
                                                className="slider slider-min"
                                            />

                                            {/* Max slider */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="100000000"
                                                step="1000000"
                                                value={priceFilter.max}
                                                onChange={(e) => {
                                                    const newMax = parseInt(e.target.value);
                                                    setPriceFilter(prev => ({
                                                        ...prev,
                                                        max: Math.max(newMax, prev.min + 1000000)
                                                    }));
                                                }}
                                                className="slider slider-max"
                                            />
                                        </div>

                                        {/* Price markers */}
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>0₫</span>
                                            <span>25M</span>
                                            <span>50M</span>
                                            <span>75M</span>
                                            <span>100M+</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sắp xếp theo
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'price-desc' | 'newest')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="name">Theo tên A-Z</option>
                                        <option value="price">Giá thấp đến cao</option>
                                        <option value="price-desc">Giá cao đến thấp</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-2 border-t">
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            setPriceFilter({ min: 0, max: 100000000 });
                                            setSortBy('newest');
                                        }}
                                        className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                    <button
                                        onClick={() => setShowFilterDropdown(false)}
                                        className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Không có sản phẩm nào được tìm thấy</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên sản phẩm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mô tả
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Giá
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-400 text-xs">No img</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs">
                                                    <p className="line-clamp-2">{product.description}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-blue-600">
                                                    {formatPrice(product.price)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="inline-flex items-center p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>

                                                    <Link
                                                        href={`/products/${product.id}/edit`}
                                                        className="inline-flex items-center p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, product })}
                                                        className="inline-flex items-center p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredProducts.length > 0 && (
                        <div className="flex items-center justify-center space-x-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Trước
                            </button>

                            <div className="flex space-x-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === page
                                                ? 'text-blue-600 bg-blue-50 border border-blue-300'
                                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    )}

                    {/* Page info */}
                    {filteredProducts.length > 0 && (
                        <div className="text-sm text-gray-600 mt-4 text-center">
                            Trang {currentPage} / {totalPages} - Hiển thị {startItem}-{endItem} trong tổng số {filteredProducts.length} sản phẩm
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && deleteModal.product && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Xác nhận xóa sản phẩm
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa sản phẩm &ldquo;<strong>{deleteModal.product.name}</strong>&rdquo;?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, product: null })}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteModal.product!.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}