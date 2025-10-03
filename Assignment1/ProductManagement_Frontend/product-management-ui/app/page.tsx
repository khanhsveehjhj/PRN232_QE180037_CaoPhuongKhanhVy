'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Eye, Filter, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { productService } from '@/lib/services/productService';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 100000000 });
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'price-desc' | 'newest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = search.trim() === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      const matchesPrice = product.price >= priceFilter.min && product.price <= priceFilter.max;

      return matchesSearch && matchesPrice;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [search, priceFilter, sortBy, products]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  }, [filteredProducts, currentPage, itemsPerPage]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

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
      <style jsx global>{`
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
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex justify-center items-center mb-4">
          <ShoppingBag className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">Cửa hàng sản phẩm</h1>
        </div>
        <p className="text-gray-600 text-lg">Khám phá các sản phẩm chất lượng cao với giá tốt nhất</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-3 items-center">
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

            {showFilterDropdown && (
              <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Khoảng giá
                  </label>

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

                  <div className="relative">
                    <div className="dual-range-slider">
                      <div className="slider-track"></div>

                      <div
                        className="slider-range"
                        style={{
                          left: `${(priceFilter.min / 100000000) * 100}%`,
                          width: `${((priceFilter.max - priceFilter.min) / 100000000) * 100}%`
                        }}
                      ></div>

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

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0₫</span>
                      <span>25M</span>
                      <span>50M</span>
                      <span>75M</span>
                      <span>100M+</span>
                    </div>
                  </div>
                </div>

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

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Không có sản phẩm nào được tìm thấy</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="aspect-w-1 aspect-h-1 h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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

          {/* Pagination Info */}
          {filteredProducts.length > 0 && (
            <div className="text-sm text-gray-600 mt-4 text-center">
              Trang {currentPage} / {totalPages} - Hiển thị {startItem}-{endItem} trong tổng số {filteredProducts.length} sản phẩm
            </div>
          )}
        </>
      )}
    </div>
  );
}
