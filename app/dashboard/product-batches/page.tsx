'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import ProductBatchModal from '@/components/ProductBatchModal';
import ConfirmModal from '@/components/ConfirmModal';
import DeletedProductBatchesModal from '@/components/DeletedProductBatchesModal';
import ViewDeletedButton from '@/components/ViewDeletedButton';
import {
  ProductBatch,
  getProductBatches,
  createProductBatch,
  updateProductBatch,
  deleteProductBatch,
  CreateProductBatchData,
  UpdateProductBatchData,
} from '@/lib/productBatches';

type ModalMode = 'create' | 'edit' | 'view';

export default function ProductBatchesPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [productBatches, setProductBatches] = useState<ProductBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [productBatchModal, setProductBatchModal] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    productBatch: ProductBatch | null;
  }>({
    isOpen: false,
    mode: 'create',
    productBatch: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productBatch: ProductBatch | null;
  }>({
    isOpen: false,
    productBatch: null,
  });

  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Fetch product batches
  const fetchProductBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProductBatches();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductBatches(response.data);
      } else if (response.code !== 200) {
        showAlert(response.message || 'Error fetching product batches', 'error');
      }
    } catch (error) {
      console.error('Error fetching product batches:', error);
      showAlert('Error fetching product batches', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProductBatches();
  }, [fetchProductBatches]);

  // Filter product batches based on search term
  const filteredProductBatches = productBatches.filter(productBatch =>
    productBatch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productBatch.codeBatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productBatch.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    productBatch.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (productBatch.description && productBatch.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle create product batch
  const handleCreate = () => {
    setProductBatchModal({
      isOpen: true,
      mode: 'create',
      productBatch: null,
    });
  };

  // Handle view product batch
  const handleView = (productBatch: ProductBatch) => {
    setProductBatchModal({
      isOpen: true,
      mode: 'view',
      productBatch,
    });
  };

  // Handle edit product batch
  const handleEdit = (productBatch: ProductBatch) => {
    setProductBatchModal({
      isOpen: true,
      mode: 'edit',
      productBatch,
    });
  };

  // Handle delete product batch
  const handleDelete = (productBatch: ProductBatch) => {
    setDeleteConfirm({
      isOpen: true,
      productBatch,
    });
  };

  // Handle modal submit
  const handleModalSubmit = async (data: CreateProductBatchData | UpdateProductBatchData) => {
    try {
      if (productBatchModal.mode === 'create') {
        await createProductBatch(data as CreateProductBatchData);
        showAlert('Product batch created successfully', 'success');
      } else if (productBatchModal.mode === 'edit' && productBatchModal.productBatch) {
        await updateProductBatch(productBatchModal.productBatch.id, data as UpdateProductBatchData);
        showAlert('Product batch updated successfully', 'success');
      }
      
      // Close modal after successful save
      setProductBatchModal({ isOpen: false, mode: 'create', productBatch: null });
      await fetchProductBatches();
    } catch (error) {
      console.error('Error saving product batch:', error);
      showAlert('Error saving product batch', 'error');
      throw error;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.productBatch) return;

    try {
      await deleteProductBatch(deleteConfirm.productBatch.id);
      showAlert('Product batch deleted successfully', 'success');
      setDeleteConfirm({ isOpen: false, productBatch: null });
      await fetchProductBatches();
    } catch (error) {
      console.error('Error deleting product batch:', error);
      showAlert('Error deleting product batch', 'error');
    }
  };

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
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Batches</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product batches, track expiration dates and batch codes
            </p>
          </div>
        </div>

        {/* Search and Actions */}
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
                  placeholder="Search product batches, products, or brands..."
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
            
            {/* Search Results Info */}
            <div className="text-sm text-gray-500">
              {searchTerm ? (
                <span>
                  Showing {filteredProductBatches.length} of {productBatches.length} product batches
                </span>
              ) : (
                <span>{productBatches.length} product batches total</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ViewDeletedButton
                onClick={() => setShowDeletedModal(true)}
                itemName="Product Batches"
              />
              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading product batches...</span>
            </div>
          ) : filteredProductBatches.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 5m10 0H5" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product batches</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No product batches match your search.' : 'Get started by creating a new product batch.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Product Batch
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exp Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <div className="flex items-center justify-end space-x-2">
                        <span>Actions</span>
                        <button
                          onClick={fetchProductBatches}
                          disabled={isLoading}
                          className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-50 transition-colors duration-200"
                          title="Refresh data"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className={isLoading ? 'animate-spin' : ''} />
                          </svg>
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProductBatches.map((productBatch, index) => (
                    <tr key={productBatch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{productBatch.productName}</div>
                        <div className="text-sm text-gray-500">{productBatch.brandName} - {productBatch.categoryName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{productBatch.codeBatch}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(productBatch.unitPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(productBatch.expDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {productBatch.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(productBatch)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(productBatch)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(productBatch)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Product Batch Modal */}
      <ProductBatchModal
        isOpen={productBatchModal.isOpen}
        onClose={() => setProductBatchModal({ isOpen: false, mode: 'create', productBatch: null })}
        onSave={handleModalSubmit}
        productBatch={productBatchModal.productBatch || undefined}
        mode={productBatchModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productBatch: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Batch"
        description={`Are you sure you want to delete batch "${deleteConfirm.productBatch?.codeBatch}" for product "${deleteConfirm.productBatch?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Deleted Product Batches Modal */}
      <DeletedProductBatchesModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        onRestore={fetchProductBatches}
      />
    </DashboardLayout>
  );
}