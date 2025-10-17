'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import PurchaseOrderModal from '@/components/PurchaseOrderModal';
import ConfirmModal from '@/components/ConfirmModal';
import DeletedPurchaseOrdersModal from '@/components/DeletedPurchaseOrdersModal';
import ViewDeletedButton from '@/components/ViewDeletedButton';
import {
  PurchaseOrder,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/lib/purchaseOrders';

type ModalMode = 'create' | 'edit' | 'view';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [purchaseOrderModal, setPurchaseOrderModal] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    purchaseOrder: PurchaseOrder | null;
  }>({
    isOpen: false,
    mode: 'create',
    purchaseOrder: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    purchaseOrder: PurchaseOrder | null;
  }>({
    isOpen: false,
    purchaseOrder: null,
  });

  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getPurchaseOrders();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setPurchaseOrders(response.data);
      } else if (response.code !== 200) {
        showAlert(response.message || 'Error fetching purchase orders', 'error');
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      showAlert('Error fetching purchase orders', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle create purchase order
  const handleCreate = () => {
    setPurchaseOrderModal({
      isOpen: true,
      mode: 'create',
      purchaseOrder: null,
    });
  };

  // Handle view purchase order
  const handleView = async (order: PurchaseOrder) => {
    try {
      const response = await getPurchaseOrderById(order.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setPurchaseOrderModal({
          isOpen: true,
          mode: 'view',
          purchaseOrder: response.data,
        });
      } else {
        showAlert('Failed to fetch purchase order details', 'error');
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      showAlert('Error fetching purchase order details', 'error');
    }
  };

  // Handle edit purchase order
  const handleEdit = async (order: PurchaseOrder) => {
    try {
      const response = await getPurchaseOrderById(order.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setPurchaseOrderModal({
          isOpen: true,
          mode: 'edit',
          purchaseOrder: response.data,
        });
      } else {
        showAlert('Failed to fetch purchase order details', 'error');
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      showAlert('Error fetching purchase order details', 'error');
    }
  };

  // Handle delete purchase order
  const handleDelete = (order: PurchaseOrder) => {
    setDeleteConfirm({
      isOpen: true,
      purchaseOrder: order,
    });
  };

  // Handle view details (navigate to detail page)
  const handleViewDetails = (order: PurchaseOrder) => {
    router.push(`/dashboard/purchase-orders/${order.id}`);
  };

  // Handle modal submit
  const handleModalSubmit = async (data: CreatePurchaseOrderData | UpdatePurchaseOrderData) => {
    try {
      if (purchaseOrderModal.mode === 'create') {
        const response = await createPurchaseOrder(data as CreatePurchaseOrderData);
        if (response.code === 200 || response.code === 201) {
          showAlert('Purchase order created successfully', 'success');
        } else {
          showAlert(response.message || 'Failed to create purchase order', 'error');
          throw new Error(response.message);
        }
      } else if (purchaseOrderModal.mode === 'edit' && purchaseOrderModal.purchaseOrder) {
        const response = await updatePurchaseOrder(purchaseOrderModal.purchaseOrder.id, data as UpdatePurchaseOrderData);
        if (response.code === 200) {
          showAlert('Purchase order updated successfully', 'success');
        } else {
          showAlert(response.message || 'Failed to update purchase order', 'error');
          throw new Error(response.message);
        }
      }
      
      // Close modal after successful save
      setPurchaseOrderModal({ isOpen: false, mode: 'create', purchaseOrder: null });
      await fetchPurchaseOrders();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      throw error;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.purchaseOrder) return;

    try {
      const response = await deletePurchaseOrder(deleteConfirm.purchaseOrder.id);
      if (response.code === 200) {
        showAlert('Purchase order deleted successfully', 'success');
        setDeleteConfirm({ isOpen: false, purchaseOrder: null });
        await fetchPurchaseOrders();
      } else {
        showAlert(response.message || 'Failed to delete purchase order', 'error');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      showAlert('Error deleting purchase order', 'error');
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage purchase orders and track their status
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
                  placeholder="Search purchase orders, users, or status..."
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
                  Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
                </span>
              ) : (
                <span>{purchaseOrders.length} purchase orders total</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ViewDeletedButton
                onClick={() => setShowDeletedModal(true)}
                itemName="Purchase Orders"
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
              <span className="ml-2 text-gray-600">Loading purchase orders...</span>
            </div>
          ) : filteredPurchaseOrders.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No purchase orders match your search.' : 'Get started by creating a new purchase order.'}
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
                    Create Purchase Order
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
                      PO Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      User
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <div className="flex items-center justify-end space-x-2">
                        <span>Actions</span>
                        <button
                          onClick={fetchPurchaseOrders}
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
                  {filteredPurchaseOrders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
                        >
                          {order.poNumber}
                        </button>
                        {order.description && (
                          <div className="text-sm text-gray-500">{order.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatPrice(order.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(order)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
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

      {/* Purchase Order Modal */}
      <PurchaseOrderModal
        isOpen={purchaseOrderModal.isOpen}
        onClose={() => setPurchaseOrderModal({ isOpen: false, mode: 'create', purchaseOrder: null })}
        onSave={handleModalSubmit}
        purchaseOrder={purchaseOrderModal.purchaseOrder || undefined}
        mode={purchaseOrderModal.mode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, purchaseOrder: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Purchase Order"
        description={`Are you sure you want to delete purchase order "${deleteConfirm.purchaseOrder?.poNumber}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Deleted Purchase Orders Modal */}
      <DeletedPurchaseOrdersModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        onRestore={fetchPurchaseOrders}
      />
    </DashboardLayout>
  );
}
