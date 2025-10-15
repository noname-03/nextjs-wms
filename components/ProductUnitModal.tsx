'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductUnit, CreateProductUnitData, UpdateProductUnitData } from '@/lib/productUnits';
import { Product, getProducts } from '@/lib/products';
import { Location, getLocations } from '@/lib/locations';
import { ProductBatch, getProductBatches } from '@/lib/productBatches';
import SearchSelect from './SearchSelect';

interface ProductUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
  productUnit?: ProductUnit;
  onSave: (data: CreateProductUnitData | UpdateProductUnitData) => Promise<void>;
  isLoading?: boolean;
  defaultProductId?: number; // ID produk yang akan di-default saat create mode
}

export default function ProductUnitModal({ isOpen, onClose, mode, productUnit, onSave, isLoading = false, defaultProductId }: ProductUnitModalProps) {
  const [formData, setFormData] = useState({
    productId: 0,
    locationId: 0,
    productBatchId: 0,
    name: '',
    quantity: 0,
    unitPrice: '',
    unitPriceRetail: '',
    barcode: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ 
    productId?: string; 
    locationId?: string; 
    productBatchId?: string; 
    name?: string; 
    quantity?: string; 
    unitPrice?: string; 
    unitPriceRetail?: string; 
    barcode?: string; 
    description?: string; 
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
      
      if (mode === 'edit' && productUnit) {
        setFormData({
          productId: productUnit.productId,
          locationId: productUnit.locationId,
          productBatchId: productUnit.productBatchId,
          name: productUnit.name,
          quantity: productUnit.quantity,
          unitPrice: productUnit.unitPrice,
          unitPriceRetail: productUnit.unitPriceRetail,
          barcode: productUnit.barcode || '',
          description: productUnit.description || '',
        });
      } else if (mode === 'create') {
        setFormData({
          productId: defaultProductId || 0, // Set default product ID jika ada
          locationId: 0,
          productBatchId: 0,
          name: '',
          quantity: 0,
          unitPrice: '',
          unitPriceRetail: '',
          barcode: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, productUnit, defaultProductId, fetchProducts, fetchLocations, fetchBatches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { 
      productId?: string; 
      locationId?: string; 
      productBatchId?: string; 
      name?: string; 
      quantity?: string; 
      unitPrice?: string; 
      unitPriceRetail?: string; 
      barcode?: string; 
      description?: string; 
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    
    // unitPriceRetail is optional, only validate if provided
    if (formData.unitPriceRetail && parseFloat(formData.unitPriceRetail) <= 0) {
      newErrors.unitPriceRetail = 'Retail price must be greater than 0';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Convert string prices to numbers before sending
      const submitData: CreateProductUnitData | UpdateProductUnitData = {
        productId: formData.productId,
        locationId: formData.locationId,
        productBatchId: formData.productBatchId,
        name: formData.name,
        quantity: formData.quantity,
        unitPrice: parseFloat(formData.unitPrice) || 0,
        unitPriceRetail: formData.unitPriceRetail ? parseFloat(formData.unitPriceRetail) : 0,
        barcode: formData.barcode,
        description: formData.description,
      };
      await onSave(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'productId' || name === 'locationId' || name === 'productBatchId' ? parseInt(value) || 0 
              : name === 'quantity' ? parseInt(value) || 0
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

  const formatPrice = (price?: string | number) => {
    if (price === undefined || price === null) return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numPrice);
  };

  if (!isOpen) {
    return null;
  }

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'View Product Unit';
      case 'create': return 'Create New Product Unit';
      case 'edit': return 'Edit Product Unit';
      default: return 'Product Unit';
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
          className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-gray-200"
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
          {mode === 'view' && productUnit ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productUnit.productName || 'Unknown Product'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productUnit.locationName || 'Unknown Location'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Batch</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productUnit.productBatchCode || 'Unknown Batch'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{productUnit.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{productUnit.quantity}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatPrice(productUnit.unitPrice)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatPrice(productUnit.unitPriceRetail)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {productUnit.barcode || 'No barcode'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                  {productUnit.description || 'No description provided'}
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
                    setFormData(prev => ({ 
                      ...prev, 
                      productId: value,
                      // Reset product batch when product changes
                      productBatchId: 0
                    }));
                    if (errors.productId) {
                      setErrors(prev => ({ ...prev, productId: undefined }));
                    }
                    // Clear product batch error if any
                    if (errors.productBatchId) {
                      setErrors(prev => ({ ...prev, productBatchId: undefined }));
                    }
                  }}
                  placeholder="Select a product"
                  disabled={isLoading || loadingProducts || (mode === 'create' && !!defaultProductId)} // Disable jika create mode dan ada defaultProductId
                  loading={loadingProducts}
                  error={errors.productId}
                />
              </div>

              {/* Location field */}
              <div>
                <SearchSelect
                  label="Location"
                  required
                  options={locations.map(location => ({
                    id: location.id,
                    name: location.name,
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

              {/* Product Batch field */}
              <div>
                <SearchSelect
                  label="Product Batch"
                  required
                  options={filteredBatches.map(batch => ({
                    id: batch.id,
                    name: batch.codeBatch,
                    displayName: `${batch.codeBatch} - ${batch.productName}`
                  }))}
                  value={formData.productBatchId}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, productBatchId: value }));
                    if (errors.productBatchId) {
                      setErrors(prev => ({ ...prev, productBatchId: undefined }));
                    }
                  }}
                  placeholder={formData.productId ? "Select a product batch" : "Please select a product first"}
                  disabled={isLoading || loadingBatches || !formData.productId}
                  loading={loadingBatches}
                  error={errors.productBatchId}
                />
                {formData.productId && !loadingBatches && (
                  <p className="mt-1 text-xs text-gray-500">
                    {filteredBatches.length > 0 
                      ? `${filteredBatches.length} batch(es) available for this product`
                      : 'No batches available for this product. Please create a batch first.'}
                  </p>
                )}
              </div>

              {/* Unit Name field */}
              <div>
                <label htmlFor="unit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  id="unit-name"
                  name="name"
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter unit name"
                  disabled={isLoading}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
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
                  autoComplete="off"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.quantity 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter quantity"
                  disabled={isLoading}
                  required
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
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

              {/* Retail Price field */}
              <div>
                <label htmlFor="retail-price" className="block text-sm font-medium text-gray-700 mb-1">
                  Retail Price (Optional)
                </label>
                <input
                  type="number"
                  id="retail-price"
                  name="unitPriceRetail"
                  autoComplete="off"
                  value={formData.unitPriceRetail}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.unitPriceRetail 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter retail price (optional)"
                  disabled={isLoading}
                />
                {errors.unitPriceRetail && (
                  <p className="mt-1 text-sm text-red-600">{errors.unitPriceRetail}</p>
                )}
              </div>

              {/* Barcode field */}
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  autoComplete="off"
                  value={formData.barcode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.barcode 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter barcode (optional)"
                  disabled={isLoading}
                />
                {errors.barcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="unit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="unit-description"
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
                  placeholder="Enter unit description (optional)"
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
                  disabled={isLoading || loadingProducts || loadingLocations || loadingBatches}
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
                    mode === 'create' ? 'Create Product Unit' : 'Update Product Unit'
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
