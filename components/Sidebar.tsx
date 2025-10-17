'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  }
];

const brandSubmenu = [
  {
    name: 'Brands',
    href: '/dashboard/brands',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    name: 'Product Batches',
    href: '/dashboard/product-batches',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    name: 'Product Units',
    href: '/dashboard/product-units',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    name: 'Product Stocks',
    href: '/dashboard/product-stocks',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  }
];

const inventorySubmenu = [
  {
    name: 'Stock',
    href: '/dashboard/inventory/stock',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  }
];

const otherMenuItems = [
  {
    name: 'Purchase Orders',
    href: '/dashboard/purchase-orders',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Suppliers',
    href: '/dashboard/suppliers',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const toggleBrandCard = () => {
    setIsBrandOpen(!isBrandOpen);
  };

  const toggleInventoryCard = () => {
    setIsInventoryOpen(!isInventoryOpen);
  };

  const isBrandActive = pathname.startsWith('/dashboard/brands') || 
                       pathname.startsWith('/dashboard/categories') || 
                       pathname.startsWith('/dashboard/products') ||
                       pathname.startsWith('/dashboard/product-batches') ||
                       pathname.startsWith('/dashboard/product-units') ||
                       pathname.startsWith('/dashboard/product-stocks');

  const isInventoryActive = pathname.startsWith('/dashboard/inventory');

  // Auto-open Brand Management section when on brand-related pages
  useEffect(() => {
    if (isBrandActive) {
      setIsBrandOpen(true);
    }
  }, [isBrandActive]);

  // Auto-open Inventory section when on inventory pages
  useEffect(() => {
    if (isInventoryActive) {
      setIsInventoryOpen(true);
    }
  }, [isInventoryActive]);

  return (
    <>
      {/* Mobile overlay - backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] bg-white shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} w-64`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex h-16 items-center justify-between px-4 border-b border-gray-200 ${isCollapsed ? 'lg:px-2' : ''}`}>
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              {!isCollapsed && (
                <span className="ml-2 text-xl font-semibold text-gray-900">WMS Admin</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Desktop toggle button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                  )}
                </svg>
              </button>
              {/* Mobile close button */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 px-4 py-4 space-y-2 ${isCollapsed ? 'lg:px-2' : ''}`}>
            {/* Dashboard Link */}
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed ? 'lg:px-2 lg:justify-center' : ''}`}
                  onClick={() => onClose()}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className={`${isActive ? 'text-indigo-700' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && item.name}
                </Link>
              );
            })}

            {/* Brand Management Card */}
            <div className="space-y-1">
              {/* Brand Header - Collapsible */}
              <button
                onClick={toggleBrandCard}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isBrandActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } ${isCollapsed ? 'lg:px-2 lg:justify-center' : ''}`}
                title={isCollapsed ? 'Brand Management' : undefined}
              >
                <div className="flex items-center">
                  <span className={`${isBrandActive ? 'text-indigo-700' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'}`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  {!isCollapsed && <span>Brand Management</span>}
                </div>
                {!isCollapsed && (
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${isBrandOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Brand Submenu */}
              {(isBrandOpen || isCollapsed) && !isCollapsed && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {brandSubmenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => onClose()}
                      >
                        <span className={`${isActive ? 'text-indigo-700' : 'text-gray-400'} mr-2`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inventory Management Card */}
            <div className="space-y-1">
              {/* Inventory Header - Collapsible */}
              <button
                onClick={toggleInventoryCard}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isInventoryActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                } ${isCollapsed ? 'lg:px-2 lg:justify-center' : ''}`}
                title={isCollapsed ? 'Inventory' : undefined}
              >
                <div className="flex items-center">
                  <span className={`${isInventoryActive ? 'text-indigo-700' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'}`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                  {!isCollapsed && <span>Inventory</span>}
                </div>
                {!isCollapsed && (
                  <svg 
                    className={`h-4 w-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Inventory Submenu */}
              {(isInventoryOpen || isCollapsed) && !isCollapsed && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {inventorySubmenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => onClose()}
                      >
                        <span className={`${isActive ? 'text-indigo-700' : 'text-gray-400'} mr-2`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other Menu Items */}
            {otherMenuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${isCollapsed ? 'lg:px-2 lg:justify-center' : ''}`}
                  onClick={() => onClose()}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className={`${isActive ? 'text-indigo-700' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`border-t border-gray-200 p-4 ${isCollapsed ? 'lg:p-2' : ''}`}>
            <div className={`flex items-center ${isCollapsed ? 'lg:justify-center' : ''}`}>
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}