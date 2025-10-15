'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import SearchSelect from '@/components/SearchSelect';
import { getInventoryStock, InventoryStock, InventoryStockFilters } from '@/lib/inventory';
import { getBrands, Brand } from '@/lib/brands';
import { getCategories, Category } from '@/lib/categories';
import { getProducts, Product } from '@/lib/products';
import { getProductBatches, ProductBatch } from '@/lib/productBatches';
import { getLocations, Location } from '@/lib/locations';

export default function InventoryStockPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Data states
  const [inventoryStock, setInventoryStock] = useState<InventoryStock[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<InventoryStockFilters>({
    brandId: undefined,
    categoryId: undefined,
    productId: undefined,
    locationId: undefined,
    productBatchId: undefined,
    barcode: undefined,
  });

  // Search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // Barcode input
  const [barcodeInput, setBarcodeInput] = useState('');

  // Fetch all master data on mount
  useEffect(() => {
    fetchBrands();
    fetchCategories();
    fetchProducts();
    fetchProductBatches();
    fetchLocations();
  }, []);

  // Fetch brands
  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const response = await getBrands();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await getCategories();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await getProducts();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch product batches
  const fetchProductBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await getProductBatches();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching product batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await getLocations();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch inventory stock based on filters
  const fetchInventoryStock = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInventoryStock(filters);
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setInventoryStock(response.data);
      } else if (response.code !== 200) {
        showAlert(response.message || 'Failed to fetch inventory stock', 'error');
      }
    } catch (error) {
      console.error('Error fetching inventory stock:', error);
      showAlert('Error fetching inventory stock', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showAlert]);

  // Fetch stock when filters change
  useEffect(() => {
    fetchInventoryStock();
  }, [fetchInventoryStock]);

  // Cascading filter: Filter categories by selected brand
  const filteredCategories = useMemo(() => {
    if (!filters.brandId) return categories;
    return categories.filter(cat => cat.brandId === filters.brandId);
  }, [categories, filters.brandId]);

  // Cascading filter: Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!filters.categoryId) return products;
    return products.filter(prod => prod.categoryId === filters.categoryId);
  }, [products, filters.categoryId]);

  // Cascading filter: Filter product batches by selected product
  const filteredProductBatches = useMemo(() => {
    if (!filters.productId) return productBatches;
    return productBatches.filter(batch => batch.productId === filters.productId);
  }, [productBatches, filters.productId]);

  // Handle filter change
  const handleFilterChange = (filterName: keyof InventoryStockFilters, value: number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };

      // Reset dependent filters when parent filter changes
      if (filterName === 'brandId') {
        newFilters.categoryId = undefined;
        newFilters.productId = undefined;
        newFilters.productBatchId = undefined;
      } else if (filterName === 'categoryId') {
        newFilters.productId = undefined;
        newFilters.productBatchId = undefined;
      } else if (filterName === 'productId') {
        newFilters.productBatchId = undefined;
      }

      return newFilters;
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      brandId: undefined,
      categoryId: undefined,
      productId: undefined,
      locationId: undefined,
      productBatchId: undefined,
      barcode: undefined,
    });
    setBarcodeInput('');
  };

  // Handle barcode search (when Enter is pressed)
  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) {
      showAlert('Please enter a barcode', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const response = await getInventoryStock({ barcode: barcodeInput.trim() });
      
      if (response.code === 200 && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const stockData = response.data[0];
        
        // Auto-fill filters based on barcode result
        setFilters({
          brandId: stockData.brandId,
          categoryId: stockData.categoryId,
          productId: stockData.productId,
          locationId: stockData.locationId,
          productBatchId: stockData.productBatchId,
          barcode: barcodeInput.trim(),
        });
        
        setInventoryStock(response.data);
        showAlert('Barcode found successfully', 'success');
      } else {
        showAlert('No inventory found for this barcode', 'error');
        setInventoryStock([]);
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      showAlert('Error searching barcode', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle barcode input key press
  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeSearch();
    }
  };

  // Filter stock based on search term
  const filteredStock = useMemo(() => {
    if (!searchTerm.trim()) return inventoryStock;
    
    const search = searchTerm.toLowerCase();
    return inventoryStock.filter(stock =>
      stock.productName.toLowerCase().includes(search) ||
      stock.brandName.toLowerCase().includes(search) ||
      stock.categoryName.toLowerCase().includes(search) ||
      stock.locationName.toLowerCase().includes(search) ||
      stock.codeBatch.toLowerCase().includes(search) ||
      (stock.barcode && stock.barcode.toLowerCase().includes(search))
    );
  }, [inventoryStock, searchTerm]);

  // Format price
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Stock</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage inventory stock levels across all locations
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Brand Filter */}
            <SearchSelect
              label="Brand"
              options={brands.map(brand => ({
                id: brand.id,
                name: brand.name,
                displayName: brand.name
              }))}
              value={filters.brandId || 0}
              onChange={(value) => handleFilterChange('brandId', value || undefined)}
              placeholder="All Brands"
              disabled={loadingBrands}
              loading={loadingBrands}
            />

            {/* Category Filter */}
            <SearchSelect
              label="Category"
              options={filteredCategories.map(cat => ({
                id: cat.id,
                name: cat.name,
                displayName: `${cat.brandName} - ${cat.name}`
              }))}
              value={filters.categoryId || 0}
              onChange={(value) => handleFilterChange('categoryId', value || undefined)}
              placeholder="All Categories"
              disabled={loadingCategories || !filters.brandId}
              loading={loadingCategories}
            />

            {/* Product Filter */}
            <SearchSelect
              label="Product"
              options={filteredProducts.map(prod => ({
                id: prod.id,
                name: prod.name,
                displayName: `${prod.brandName} - ${prod.categoryName} - ${prod.name}`
              }))}
              value={filters.productId || 0}
              onChange={(value) => handleFilterChange('productId', value || undefined)}
              placeholder="All Products"
              disabled={loadingProducts || !filters.categoryId}
              loading={loadingProducts}
            />

            {/* Product Batch Filter */}
            <SearchSelect
              label="Product Batch"
              options={filteredProductBatches.map(batch => ({
                id: batch.id,
                name: batch.codeBatch,
                displayName: `${batch.codeBatch} - ${batch.productName}`
              }))}
              value={filters.productBatchId || 0}
              onChange={(value) => handleFilterChange('productBatchId', value || undefined)}
              placeholder="All Batches"
              disabled={loadingBatches || !filters.productId}
              loading={loadingBatches}
            />

            {/* Location Filter */}
            <SearchSelect
              label="Location"
              options={locations.map(loc => ({
                id: loc.id,
                name: loc.name,
                displayName: loc.name
              }))}
              value={filters.locationId || 0}
              onChange={(value) => handleFilterChange('locationId', value || undefined)}
              placeholder="All Locations"
              disabled={loadingLocations}
              loading={loadingLocations}
            />

            {/* Barcode Filter */}
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                Barcode
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeKeyPress}
                  placeholder="Enter barcode and press Enter"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  disabled={isLoading}
                />
                {barcodeInput && (
                  <button
                    onClick={() => setBarcodeInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Results */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500">
              {searchTerm ? (
                <span>
                  Showing {filteredStock.length} of {inventoryStock.length} items
                </span>
              ) : (
                <span>{inventoryStock.length} items total</span>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchInventoryStock}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            >
              <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading inventory stock...</span>
            </div>
          ) : filteredStock.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory stock</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No inventory stock matches your search.' : hasActiveFilters ? 'No inventory stock matches your filters.' : 'No inventory stock available.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Batch Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-28">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Exp Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStock.map((stock, index) => {
                    const qty = stock.stock ?? stock.quantity ?? 0;
                    const price = stock.productUnitPrice ?? stock.unitPrice ?? 0;
                    
                    return (
                      <tr key={`stock-${stock.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stock.brandName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stock.categoryName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{stock.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stock.codeBatch}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap w-28">
                          <div className="text-sm text-gray-900">{stock.barcode || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stock.locationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{qty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(price * qty)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(stock.expDate)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
