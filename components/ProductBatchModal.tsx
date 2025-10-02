'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductBatch, CreateProductBatchData, UpdateProductBatchData } from '@/lib/productBatches';
import { Product, getProducts } from '@/lib/products';
import SearchSelect from './SearchSelect';

interface ProductBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
  productBatch?: ProductBatch;
  onSave: (data: CreateProductBatchData | UpdateProductBatchData) => Promise<void>;
  isLoading?: boolean;
}

export default function ProductBatchModal({ isOpen, onClose, mode, productBatch, onSave, isLoading = false }: ProductBatchModalProps) {
  const [formData, setFormData] = useState<CreateProductBatchData>({
    productId: 0,
    codeBatch: '',
    unitPrice: 0,
    expDate: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ productId?: string; codeBatch?: string; unitPrice?: string; expDate?: string; description?: string }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await getProducts();
      if (response.code === 200 && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      
      if (mode === 'edit' && productBatch) {
        setFormData({
          productId: productBatch.productId,
          codeBatch: productBatch.codeBatch,
          unitPrice: productBatch.unitPrice || 0,
          expDate: productBatch.expDate ? new Date(productBatch.expDate).toISOString().split('T')[0] : '',
          description: productBatch.description || '',
        });
      } else if (mode === 'create') {
        setFormData({
          productId: 0,
          codeBatch: '',
          unitPrice: 0,
          expDate: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, productBatch, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { productId?: string; codeBatch?: string; unitPrice?: string; expDate?: string; description?: string } = {};
    
    if (!formData.productId || formData.productId === 0) {
      newErrors.productId = 'Product is required';
    }
    
    if (!formData.codeBatch.trim()) {
      newErrors.codeBatch = 'Batch code is required';
    }
    
    if (!formData.unitPrice || formData.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    
    if (!formData.expDate) {
      newErrors.expDate = 'Expiry date is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' ? parseInt(value) || 0 
              : name === 'unitPrice' ? parseFloat(value) || 0
              : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (!isOpen) {
    return null;
  }

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'View Product Batch';
      case 'create': return 'Create New Product Batch';
      case 'edit': return 'Edit Product Batch';
      default: return 'Product Batch';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 99999 }}>
      {/* Background overlay dengan warna agak hitam */}
      <div
        className="fixed inset-0 bg-gray-500/75 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

        {/* Modal panel */}
        <div 
          className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-gray-200"
          style={{ zIndex: 99999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {mode === 'view' && productBatch ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productBatch.productName || 'Unknown Product'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productBatch.categoryName || 'Unknown Category'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productBatch.brandName || 'Unknown Brand'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{productBatch.codeBatch}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatPrice(productBatch.unitPrice)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productBatch.expDate ? new Date(productBatch.expDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                  {productBatch.description || 'No description provided'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product field */}
              <div>
                <SearchSelect
                  label="Product"
                  required
                  options={products.map(product => ({
                    id: product.id,
                    name: product.name,
                    displayName: `${product.brandName} - ${product.categoryName} - ${product.name}`
                  }))}
                  value={formData.productId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, productId: value }));
                    if (errors.productId) {
                      setErrors(prev => ({ ...prev, productId: undefined }));
                    }
                  }}
                  placeholder="Select a product"
                  disabled={isLoading || loadingProducts}
                  loading={loadingProducts}
                  error={errors.productId}
                />
              </div>

              {/* Batch Code field */}
              <div>
                <label htmlFor="batch-code" className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Code *
                </label>
                <input
                  type="text"
                  id="batch-code"
                  name="codeBatch"
                  autoComplete="off"
                  value={formData.codeBatch}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.codeBatch 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter batch code"
                  disabled={isLoading}
                  required
                />
                {errors.codeBatch && (
                  <p className="mt-1 text-sm text-red-600">{errors.codeBatch}</p>
                )}
              </div>

              {/* Unit Price field */}
              <div>
                <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price *
                </label>
                <input
                  type="number"
                  id="unit-price"
                  name="unitPrice"
                  autoComplete="off"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.unitPrice 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter unit price"
                  disabled={isLoading}
                  required
                />
                {errors.unitPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
                )}
              </div>

              {/* Expiry Date field */}
              <div>
                <label htmlFor="exp-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  id="exp-date"
                  name="expDate"
                  autoComplete="off"
                  value={formData.expDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.expDate 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  disabled={isLoading}
                  required
                />
                {errors.expDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expDate}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="batch-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="batch-description"
                  name="description"
                  autoComplete="off"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter batch description (optional)"
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || loadingProducts}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    mode === 'create' ? 'Create Product Batch' : 'Update Product Batch'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}