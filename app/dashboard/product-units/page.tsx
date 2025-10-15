'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import ProductUnitModal from '@/components/ProductUnitModal';
import ConfirmModal from '@/components/ConfirmModal';
import DeletedProductUnitsModal from '@/components/DeletedProductUnitsModal';
import ViewDeletedButton from '@/components/ViewDeletedButton';
import {
  ProductUnit,
  getProductUnits,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
  getProductUnitById,
  CreateProductUnitData,
  UpdateProductUnitData,
} from '@/lib/productUnits';

type ModalMode = 'create' | 'edit' | 'view';

export default function ProductUnitsPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [productUnitModal, setProductUnitModal] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    productUnit: ProductUnit | null;
  }>({
    isOpen: false,
    mode: 'create',
    productUnit: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productUnit: ProductUnit | null;
  }>({
    isOpen: false,
    productUnit: null,
  });

  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Fetch product units
  const fetchProductUnits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProductUnits();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setProductUnits(response.data);
      } else if (response.code !== 200) {
        showAlert(response.message || 'Error fetching product units', 'error');
      }
    } catch (error) {
      console.error('Error fetching product units:', error);
      showAlert('Error fetching product units', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchProductUnits();
  }, [fetchProductUnits]);

  // Filter product units based on search term
  const filteredProductUnits = productUnits.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.productBatchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.barcode && unit.barcode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle create product unit
  const handleCreate = () => {
    setProductUnitModal({
      isOpen: true,
      mode: 'create',
      productUnit: null,
    });
  };

  // Handle view product unit
  const handleView = async (unit: ProductUnit) => {
    try {
      const response = await getProductUnitById(unit.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setProductUnitModal({
          isOpen: true,
          mode: 'view',
          productUnit: response.data,
        });
      } else {
        showAlert('Failed to fetch product unit details', 'error');
      }
    } catch (error) {
      console.error('Error fetching product unit:', error);
      showAlert('Error fetching product unit details', 'error');
    }
  };

  // Handle edit product unit
  const handleEdit = async (unit: ProductUnit) => {
    try {
      const response = await getProductUnitById(unit.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setProductUnitModal({
          isOpen: true,
          mode: 'edit',
          productUnit: response.data,
        });
      } else {
        showAlert('Failed to fetch product unit details', 'error');
      }
    } catch (error) {
      console.error('Error fetching product unit:', error);
      showAlert('Error fetching product unit details', 'error');
    }
  };

  // Handle delete product unit
  const handleDelete = (unit: ProductUnit) => {
    setDeleteConfirm({
      isOpen: true,
      productUnit: unit,
    });
  };

  // Handle modal submit
  const handleModalSubmit = async (data: CreateProductUnitData | UpdateProductUnitData) => {
    try {
      if (productUnitModal.mode === 'create') {
        const response = await createProductUnit(data as CreateProductUnitData);
        if (response.code === 200 || response.code === 201) {
          showAlert('Product unit created successfully', 'success');
        } else {
          showAlert(response.message || 'Failed to create product unit', 'error');
          throw new Error(response.message);
        }
      } else if (productUnitModal.mode === 'edit' && productUnitModal.productUnit) {
        const response = await updateProductUnit(productUnitModal.productUnit.id, data as UpdateProductUnitData);
        if (response.code === 200) {
          showAlert('Product unit updated successfully', 'success');
        } else {
          showAlert(response.message || 'Failed to update product unit', 'error');
          throw new Error(response.message);
        }
      }
      
      // Close modal after successful save
      setProductUnitModal({ isOpen: false, mode: 'create', productUnit: null });
      await fetchProductUnits();
    } catch (error) {
      console.error('Error saving product unit:', error);
      throw error;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.productUnit) return;

    try {
      const response = await deleteProductUnit(deleteConfirm.productUnit.id);
      if (response.code === 200) {
        showAlert('Product unit deleted successfully', 'success');
        setDeleteConfirm({ isOpen: false, productUnit: null });
        await fetchProductUnits();
      } else {
        showAlert(response.message || 'Failed to delete product unit', 'error');
      }
    } catch (error) {
      console.error('Error deleting product unit:', error);
      showAlert('Error deleting product unit', 'error');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Units</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage product units, track inventory and pricing
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
                  placeholder="Search product units, products, or locations..."
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
                  Showing {filteredProductUnits.length} of {productUnits.length} product units
                </span>
              ) : (
                <span>{productUnits.length} product units total</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ViewDeletedButton
                onClick={() => setShowDeletedModal(true)}
                itemName="Product Units"
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
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading product units...</span>
            </div>
          ) : filteredProductUnits.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product units</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No product units match your search.' : 'Get started by creating a new product unit.'}
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
                    Create Product Unit
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
                      Unit Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Product
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
                  {filteredProductUnits.map((unit, index) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.locationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{unit.productBatchCode}</div>
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
                            onClick={() => handleView(unit)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(unit)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(unit)}
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

      {/* Product Unit Modal */}
      <ProductUnitModal
        isOpen={productUnitModal.isOpen}
        onClose={() => setProductUnitModal({ isOpen: false, mode: 'create', productUnit: null })}
        onSave={handleModalSubmit}
        productUnit={productUnitModal.productUnit || undefined}
        mode={productUnitModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productUnit: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Unit"
        description={`Are you sure you want to delete unit "${deleteConfirm.productUnit?.name}" for product "${deleteConfirm.productUnit?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Deleted Product Units Modal */}
      <DeletedProductUnitsModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        onRestore={fetchProductUnits}
      />
    </DashboardLayout>
  );
}
