'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductStock, CreateProductStockData, UpdateProductStockData } from '@/lib/productStocks';
import { Product, getProducts } from '@/lib/products';
import { Location, getLocations } from '@/lib/locations';
import { ProductBatch, getProductBatches } from '@/lib/productBatches';
import SearchSelect from './SearchSelect';

interface ProductStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
  productStock?: ProductStock;
  onSave: (data: CreateProductStockData | UpdateProductStockData) => Promise<void>;
  isLoading?: boolean;
  defaultProductId?: number;
}

export default function ProductStockModal({ 
  isOpen, 
  onClose, 
  mode, 
  productStock, 
  onSave, 
  isLoading = false,
  defaultProductId 
}: ProductStockModalProps) {
  const [formData, setFormData] = useState({
    productId: 0,
    locationId: 0,
    productBatchId: 0,
    quantity: 0,
  });
  
  const [errors, setErrors] = useState<{ 
    productId?: string; 
    locationId?: string; 
    productBatchId?: string; 
    quantity?: string; 
  }>({});
  
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Filter batches based on selected product
  const filteredBatches = formData.productId 
    ? batches.filter(batch => batch.productId === formData.productId)
    : [];

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

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const response = await getLocations();
      if (response.code === 200 && Array.isArray(response.data)) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const response = await getProductBatches();
      if (response.code === 200 && Array.isArray(response.data)) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchLocations();
      fetchBatches();
      
      if (mode === 'edit' && productStock) {
        setFormData({
          productId: productStock.productId,
          locationId: productStock.locationId,
          productBatchId: productStock.productBatchId,
          quantity: productStock.quantity,
        });
      } else if (mode === 'create') {
        setFormData({
          productId: defaultProductId || 0,
          locationId: 0,
          productBatchId: 0,
          quantity: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, productStock, defaultProductId, fetchProducts, fetchLocations, fetchBatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { 
      productId?: string; 
      locationId?: string; 
      productBatchId?: string; 
      quantity?: string; 
    } = {};
    
    if (!formData.productId || formData.productId === 0) {
      newErrors.productId = 'Product is required';
    }
    
    if (!formData.locationId || formData.locationId === 0) {
      newErrors.locationId = 'Location is required';
    }
    
    if (!formData.productBatchId || formData.productBatchId === 0) {
      newErrors.productBatchId = 'Product batch is required';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Create Product Stock';
      case 'edit': return 'Edit Product Stock';
      case 'view': return 'Product Stock Details';
      default: return 'Product Stock';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={mode === 'view' ? onClose : undefined}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 px-6 pt-6">
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
          {mode === 'view' && productStock ? (
            <div className="space-y-4 px-6 pb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productStock.productName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Batch</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productStock.productBatchCode}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productStock.locationName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productStock.quantity}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
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
                    setFormData(prev => ({ 
                      ...prev, 
                      productId: value,
                      productBatchId: 0
                    }));
                    if (errors.productId) {
                      setErrors(prev => ({ ...prev, productId: undefined }));
                    }
                    if (errors.productBatchId) {
                      setErrors(prev => ({ ...prev, productBatchId: undefined }));
                    }
                  }}
                  placeholder="Select a product"
                  disabled={isLoading || loadingProducts || (mode === 'create' && !!defaultProductId)}
                  loading={loadingProducts}
                  error={errors.productId}
                />
              </div>

              {/* Product Batch field */}
              <div>
                <SearchSelect
                  label="Product Batch"
                  required
                  options={filteredBatches.map(batch => ({
                    id: batch.id,
                    name: batch.codeBatch,
                    displayName: `${batch.codeBatch} - Exp: ${batch.expDate ? new Date(batch.expDate).toLocaleDateString() : 'N/A'}`
                  }))}
                  value={formData.productBatchId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, productBatchId: value }));
                    if (errors.productBatchId) {
                      setErrors(prev => ({ ...prev, productBatchId: undefined }));
                    }
                  }}
                  placeholder="Select a product batch"
                  disabled={isLoading || loadingBatches || !formData.productId}
                  loading={loadingBatches}
                  error={errors.productBatchId}
                />
                {formData.productId && filteredBatches.length === 0 && !loadingBatches && (
                  <p className="mt-1 text-sm text-amber-600">
                    No batches available for this product
                  </p>
                )}
                {formData.productId && filteredBatches.length > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {filteredBatches.length} batch(es) available
                  </p>
                )}
              </div>

              {/* Location field */}
              <div>
                <SearchSelect
                  label="Location"
                  required
                  options={locations.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    displayName: loc.name
                  }))}
                  value={formData.locationId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, locationId: value }));
                    if (errors.locationId) {
                      setErrors(prev => ({ ...prev, locationId: undefined }));
                    }
                  }}
                  placeholder="Select a location"
                  disabled={isLoading || loadingLocations}
                  loading={loadingLocations}
                  error={errors.locationId}
                />
              </div>

              {/* Quantity field */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.quantity 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  disabled={isLoading || mode === 'view'}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              {/* Actions */}
              {mode !== 'view' && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
