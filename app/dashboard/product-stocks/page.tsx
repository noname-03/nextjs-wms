'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import ProductStockModal from '@/components/ProductStockModal';
import ConfirmModal from '@/components/ConfirmModal';
import { 
  getProductStocks, 
  ProductStock,
  createProductStock,
  updateProductStock,
  deleteProductStock,
  getProductStockById,
  CreateProductStockData,
  UpdateProductStockData
} from '@/lib/productStocks';

type ModalMode = 'create' | 'edit' | 'view';

export default function ProductStocksPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    productStock: ProductStock | undefined;
  }>({
    isOpen: false,
    mode: 'create',
    productStock: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productStock: ProductStock | null;
  }>({
    isOpen: false,
    productStock: null,
  });

  // Fetch product stocks
  const fetchProductStocks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProductStocks();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductStocks(response.data);
      } else if (response.code !== 200) {
        showAlert(response.message || 'Error fetching product stocks', 'error');
      }
    } catch (error) {
      console.error('Error fetching product stocks:', error);
      showAlert('Error fetching product stocks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProductStocks();
  }, [fetchProductStocks]);

  // Filter product stocks based on search term
  const filteredProductStocks = productStocks.filter(stock =>
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.productBatchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.locationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create
  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      productStock: undefined,
    });
  };

  // Handle view
  const handleView = async (productStock: ProductStock) => {
    try {
      const response = await getProductStockById(productStock.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setModalState({
          isOpen: true,
          mode: 'view',
          productStock: response.data,
        });
      } else {
        showAlert('Failed to fetch product stock details', 'error');
      }
    } catch (error) {
      console.error('Error fetching product stock:', error);
      showAlert('Error fetching product stock details', 'error');
    }
  };

  // Handle edit
  const handleEdit = async (productStock: ProductStock) => {
    try {
      const response = await getProductStockById(productStock.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setModalState({
          isOpen: true,
          mode: 'edit',
          productStock: response.data,
        });
      } else {
        showAlert('Failed to fetch product stock details', 'error');
      }
    } catch (error) {
      console.error('Error fetching product stock:', error);
      showAlert('Error fetching product stock details', 'error');
    }
  };

  // Handle delete
  const handleDelete = (productStock: ProductStock) => {
    setDeleteConfirm({
      isOpen: true,
      productStock: productStock,
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteConfirm.productStock) return;

    try {
      const response = await deleteProductStock(deleteConfirm.productStock.id);
      if (response.code === 200) {
        showAlert('Product stock deleted successfully', 'success');
        setDeleteConfirm({ isOpen: false, productStock: null });
        await fetchProductStocks();
      } else {
        showAlert(response.message || 'Failed to delete product stock', 'error');
      }
    } catch (error) {
      console.error('Error deleting product stock:', error);
      showAlert('Error deleting product stock', 'error');
    }
  };

  // Handle modal save
  const handleModalSave = async (data: CreateProductStockData | UpdateProductStockData) => {
    setIsSubmitting(true);
    try {
      if (modalState.mode === 'create') {
        const response = await createProductStock(data as CreateProductStockData);
        if (response.code === 200 || response.code === 201) {
          showAlert('Product stock created successfully', 'success');
          setModalState({ isOpen: false, mode: 'create', productStock: undefined });
          await fetchProductStocks();
        } else {
          showAlert(response.message || 'Failed to create product stock', 'error');
          throw new Error(response.message);
        }
      } else if (modalState.mode === 'edit' && modalState.productStock) {
        const response = await updateProductStock(modalState.productStock.id, data as UpdateProductStockData);
        if (response.code === 200) {
          showAlert('Product stock updated successfully', 'success');
          setModalState({ isOpen: false, mode: 'create', productStock: undefined });
          await fetchProductStocks();
        } else {
          showAlert(response.message || 'Failed to update product stock', 'error');
          throw new Error(response.message);
        }
      }
    } catch (error) {
      console.error('Error saving product stock:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Stocks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product stock levels across locations
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
                  placeholder="Search product stocks, products, or locations..."
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
                  Showing {filteredProductStocks.length} of {productStocks.length} product stocks
                </span>
              ) : (
                <span>{productStocks.length} product stocks total</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading product stocks...</span>
            </div>
          ) : filteredProductStocks.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product stocks</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No product stocks match your search.' : 'Get started by creating a new product stock.'}
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
                    Create Product Stock
                  </button>
                </div>
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Batch Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <div className="flex items-center justify-end space-x-2">
                        <span>Actions</span>
                        <button
                          onClick={fetchProductStocks}
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
                  {filteredProductStocks.map((stock, index) => (
                    <tr key={stock.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stock.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.productBatchCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.locationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{stock.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(stock)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(stock)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(stock)}
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

      {/* Product Stock Modal */}
      <ProductStockModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'create', productStock: undefined })}
        mode={modalState.mode}
        productStock={modalState.productStock}
        onSave={handleModalSave}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productStock: null })}
        onConfirm={confirmDelete}
        title="Delete Product Stock?"
        description="Are you sure you want to delete this product stock? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </DashboardLayout>
  );
}
