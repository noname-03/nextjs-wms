'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { getProduct, Product } from '@/lib/products';
import { getProductBatchesByProduct, ProductBatch } from '@/lib/productBatches';
import { getProductUnitsByProduct, ProductUnit } from '@/lib/productUnits';

export default function ProductViewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [mounted, setMounted] = useState(false);

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  // Product Batches state
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<ProductBatch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Product Units state
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<ProductUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitSearchTerm, setUnitSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      console.log('🚫 Product view page - No user, redirecting to login');
      router.push('/login');
    }
  }, [user, authLoading, router, mounted]);

  // Validate productId
  useEffect(() => {
    if (mounted && isNaN(productId)) {
      showAlert('Invalid product ID', 'error');
      router.push('/dashboard/products');
    }
  }, [mounted, productId, router, showAlert]);

  const fetchProduct = useCallback(async () => {
    if (isNaN(productId)) return;
    
    setProductLoading(true);
    try {
      const response = await getProduct(productId);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setProduct(response.data);
      } else {
        showAlert('Product not found', 'error');
        router.push('/dashboard/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showAlert('Failed to fetch product', 'error');
      router.push('/dashboard/products');
    } finally {
      setProductLoading(false);
    }
  }, [productId, showAlert, router]);

  const fetchProductBatches = useCallback(async () => {
    if (isNaN(productId)) return;
    
    setBatchesLoading(true);
    try {
      const response = await getProductBatchesByProduct(productId);
      
      if (response.code === 200 && Array.isArray(response.data)) {
        setBatches(response.data);
        setFilteredBatches(response.data);
      } else {
        showAlert(response.message || 'Failed to fetch product batches', 'error');
        setBatches([]);
        setFilteredBatches([]);
      }
    } catch (error) {
      console.error('Error fetching product batches:', error);
      showAlert('Failed to fetch product batches', 'error');
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  }, [productId, showAlert]);

  const fetchProductUnits = useCallback(async () => {
    if (isNaN(productId)) return;
    
    setUnitsLoading(true);
    try {
      const response = await getProductUnitsByProduct(productId);
      
      if (response.code === 200 && Array.isArray(response.data)) {
        setUnits(response.data);
        setFilteredUnits(response.data);
      } else {
        showAlert(response.message || 'Failed to fetch product units', 'error');
        setUnits([]);
        setFilteredUnits([]);
      }
    } catch (error) {
      console.error('Error fetching product units:', error);
      showAlert('Failed to fetch product units', 'error');
      setUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  }, [productId, showAlert]);

  useEffect(() => {
    if (mounted && user && !isNaN(productId)) {
      fetchProduct();
      fetchProductBatches();
      fetchProductUnits();
    }
  }, [mounted, user, productId, fetchProduct, fetchProductBatches, fetchProductUnits]);

  // Filter product batches based on search term
  useEffect(() => {
    if (!batchSearchTerm.trim()) {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter(batch =>
        batch.codeBatch.toLowerCase().includes(batchSearchTerm.toLowerCase()) ||
        (batch.description && batch.description.toLowerCase().includes(batchSearchTerm.toLowerCase()))
      );
      setFilteredBatches(filtered);
    }
  }, [batches, batchSearchTerm]);

  // Filter product units based on search term
  useEffect(() => {
    if (!unitSearchTerm.trim()) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit =>
        unit.name.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
        unit.locationName.toLowerCase().includes(unitSearchTerm.toLowerCase()) ||
        (unit.productBatchCode && unit.productBatchCode.toLowerCase().includes(unitSearchTerm.toLowerCase())) ||
        (unit.barcode && unit.barcode.toLowerCase().includes(unitSearchTerm.toLowerCase()))
      );
      setFilteredUnits(filtered);
    }
  }, [units, unitSearchTerm]);

  // Format date
  const formatDate = (dateString: string) => {
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

  // Format price
  const formatPrice = (price?: string | number) => {
    if (price === undefined || price === null) return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numPrice);
  };

  if (!mounted || authLoading || productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="mt-2 text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user || !product) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Product Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/products')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Back to Products"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-sm text-gray-500">
                  Brand: {product.brandName} • Category: {product.categoryName} • {product.description || 'Product batches and units management'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Batches Section */}
        <div className="space-y-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate">
                Product Batches for {product.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage product batches and track expiration dates.
              </p>
            </div>
          </div>

          {/* Search and Controls for Batches */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
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
                    placeholder="Search product batches..."
                    value={batchSearchTerm}
                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {batchSearchTerm && (
                    <button
                      onClick={() => setBatchSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Info */}
              <div className="text-sm text-gray-500">
                {batchSearchTerm ? (
                  <span>
                    Showing {filteredBatches.length} of {batches.length} batches
                  </span>
                ) : (
                  <span>{batches.length} batches total</span>
                )}
              </div>
            </div>
          </div>

          {/* Batches Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {batchesLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Product Batches</h3>
                <p className="text-gray-500">Please wait while we fetch the data...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 5m10 0H5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {batchSearchTerm ? 'No batches found' : 'No Product Batches Found'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {batchSearchTerm ? (
                    <>No product batches match your search for "{batchSearchTerm}"</>
                  ) : (
                    `No product batches found for ${product.name}.`
                  )}
                </p>
                {batchSearchTerm && (
                  <button
                    onClick={() => setBatchSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear search
                  </button>
                )}
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
                        Batch Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Exp Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        <div className="flex items-center justify-end space-x-2">
                          <span>Actions</span>
                          <button
                            onClick={fetchProductBatches}
                            disabled={batchesLoading}
                            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors duration-200"
                            title="Refresh data"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className={batchesLoading ? 'animate-spin' : ''} />
                            </svg>
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBatches.map((batch, index) => (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch.codeBatch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(batch.unitPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(batch.expDate)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {batch.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/dashboard/product-batches`)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                              title="View in Product Batches"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Product Units Section */}
        <div className="space-y-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate">
                Product Units for {product.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage product units and track inventory locations.
              </p>
            </div>
          </div>

          {/* Search and Controls for Units */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
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
                    placeholder="Search product units..."
                    value={unitSearchTerm}
                    onChange={(e) => setUnitSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {unitSearchTerm && (
                    <button
                      onClick={() => setUnitSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Info */}
              <div className="text-sm text-gray-500">
                {unitSearchTerm ? (
                  <span>
                    Showing {filteredUnits.length} of {units.length} units
                  </span>
                ) : (
                  <span>{units.length} units total</span>
                )}
              </div>
            </div>
          </div>

          {/* Units Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {unitsLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Product Units</h3>
                <p className="text-gray-500">Please wait while we fetch the data...</p>
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {unitSearchTerm ? 'No units found' : 'No Product Units Found'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {unitSearchTerm ? (
                    <>No product units match your search for "{unitSearchTerm}"</>
                  ) : (
                    `No product units found for ${product.name}.`
                  )}
                </p>
                {unitSearchTerm && (
                  <button
                    onClick={() => setUnitSearchTerm('')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear search
                  </button>
                )}
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
                        Unit Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Batch Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Retail Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Barcode
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        <div className="flex items-center justify-end space-x-2">
                          <span>Actions</span>
                          <button
                            onClick={fetchProductUnits}
                            disabled={unitsLoading}
                            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors duration-200"
                            title="Refresh data"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className={unitsLoading ? 'animate-spin' : ''} />
                            </svg>
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUnits.map((unit, index) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{unit.locationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{unit.productBatchCode || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{unit.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(unit.unitPrice)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatPrice(unit.unitPriceRetail)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{unit.barcode || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                              title="View Details"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
