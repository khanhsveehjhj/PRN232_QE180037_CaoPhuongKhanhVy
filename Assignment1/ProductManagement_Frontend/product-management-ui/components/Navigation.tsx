'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Settings, ShoppingCart, Menu, X } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        {
            name: 'Trang chủ',
            href: '/',
            icon: Home,
        },
        {
            name: 'Quản lý sản phẩm',
            href: '/products',
            icon: Settings,
        },
    ]; return (
        <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                                <ShoppingCart className="h-8 w-8 text-blue-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">
                                    Cửa hàng
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-8 md:flex md:space-x-8">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                            : 'border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Mở menu</span>
                            {isMobileMenuOpen ? (
                                <X className="block h-6 w-6" />
                            ) : (
                                <Menu className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
                                    : 'text-gray-600 hover:bg-white hover:text-blue-600 border-l-4 border-transparent hover:border-blue-300'
                                    }`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}