'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/lib/products';
import { ProductBatch, getProductBatchesByProduct } from '@/lib/productBatches';
import { ProductUnit, getProductUnitsByProduct } from '@/lib/productUnits';
import { useAlert } from '@/components/AlertProvider';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onCreateBatch?: () => void;
  onEditBatch?: (batch: ProductBatch) => void;
  onDeleteBatch?: (batch: ProductBatch) => void;
  onCreateUnit?: () => void;
  onEditUnit?: (unit: ProductUnit) => void;
  onDeleteUnit?: (unit: ProductUnit) => void;
}

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onCreateBatch,
  onEditBatch,
  onDeleteBatch,
  onCreateUnit,
  onEditUnit,
  onDeleteUnit,
}: ProductDetailsModalProps) {
  const { showAlert } = useAlert();
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [activeTab, setActiveTab] = useState<'batches' | 'units'>('batches');

  useEffect(() => {
    if (isOpen && product) {
      fetchProductBatches();
      fetchProductUnits();
    }
  }, [isOpen, product]);

  const fetchProductBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await getProductBatchesByProduct(product.id);
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductBatches(response.data);
      }
    } catch (error) {
      console.error('Error fetching product batches:', error);
      showAlert('Error fetching product batches', 'error');
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchProductUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await getProductUnitsByProduct(product.id);
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductUnits(response.data);
      }
    } catch (error) {
      console.error('Error fetching product units:', error);
      showAlert('Error fetching product units', 'error');
    } finally {
      setLoadingUnits(false);
    }
  };

  // Format price
  const formatPrice = (price?: number | string) => {
    if (price === undefined || price === null) return '-';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numPrice);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Product Details: {product.name}
                </h3>
                <p className="mt-1 text-sm text-indigo-100">
                  {product.brandName} - {product.categoryName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-indigo-100 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('batches')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'batches'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Batches ({productBatches.length})
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'units'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Units ({productUnits.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'batches' ? (
              <div>
                {/* Batches Header */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Product Batches</h4>
                  {onCreateBatch && (
                    <button
                      onClick={onCreateBatch}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Batch
                    </button>
                  )}
                </div>

                {/* Batches Table */}
                {loadingBatches ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading batches...</span>
                  </div>
                ) : productBatches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No product batches found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exp Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productBatches.map((batch, index) => (
                          <tr key={batch.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{batch.codeBatch}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(batch.unitPrice)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(batch.expDate)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{batch.description || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {onEditBatch && (
                                  <button
                                    onClick={() => onEditBatch(batch)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="Edit"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                                {onDeleteBatch && (
                                  <button
                                    onClick={() => onDeleteBatch(batch)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Units Header */}
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Product Units</h4>
                  {onCreateUnit && (
                    <button
                      onClick={onCreateUnit}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Unit
                    </button>
                  )}
                </div>

                {/* Units Table */}
                {loadingUnits ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading units...</span>
                  </div>
                ) : productUnits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No product units found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retail Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productUnits.map((unit, index) => (
                          <tr key={unit.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{unit.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unit.locationName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unit.productBatchCode}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unit.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(unit.unitPrice)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatPrice(unit.unitPriceRetail)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unit.barcode}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                {onEditUnit && (
                                  <button
                                    onClick={() => onEditUnit(unit)}
                                    className="text-yellow-600 hover:text-yellow-900"
                                    title="Edit"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                                {onDeleteUnit && (
                                  <button
                                    onClick={() => onDeleteUnit(unit)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
