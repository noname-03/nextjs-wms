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
  filterPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderById,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderFilterParams,
} from '@/lib/purchaseOrders';
import { Reseller, getResellers } from '@/lib/resellers';

type ModalMode = 'create' | 'edit' | 'view';
type StatusType = 'all' | 'draft' | 'submitted' | 'approved' | 'received' | 'closed';

interface FilterState {
  status: StatusType;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [allOrders, setAllOrders] = useState<PurchaseOrder[]>([]); // Store all orders for counting
  const [resellers, setResellers] = useState<Reseller[]>([]); // Store resellers for dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showResellerDropdown, setShowResellerDropdown] = useState(false);
  const [resellerSearch, setResellerSearch] = useState('');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
  });

  // Temporary filter state for advanced panel
  const [tempFilters, setTempFilters] = useState<FilterState>({
    status: 'all',
  });

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

  // Fetch all purchase orders (for counting)
  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await getPurchaseOrders();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setAllOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching all purchase orders:', error);
    }
  }, []);

  // Fetch resellers
  const fetchResellers = useCallback(async () => {
    try {
      const resellersList = await getResellers();
      setResellers(resellersList);
    } catch (error) {
      console.error('Error fetching resellers:', error);
      showAlert('Failed to fetch resellers', 'error');
    }
  }, [showAlert]);

  // Fetch purchase orders with filters
  const fetchPurchaseOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      
      // Build filter params
      const hasFilters = filters.status !== 'all' || filters.userId || filters.dateFrom || filters.dateTo;
      
      if (hasFilters) {
        const params: PurchaseOrderFilterParams = {};
        
        if (filters.status !== 'all') {
          params.status = filters.status;
        }
        if (filters.userId) {
          params.user_id = filters.userId;
        }
        if (filters.dateFrom) {
          params.order_date_from = filters.dateFrom;
        }
        if (filters.dateTo) {
          params.order_date_to = filters.dateTo;
        }
        
        response = await filterPurchaseOrders(params);
      } else {
        response = await getPurchaseOrders();
      }
      
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
  }, [filters, showAlert]);

  useEffect(() => {
    fetchAllOrders(); // Fetch all for counting
    fetchResellers(); // Fetch resellers for dropdown
  }, [fetchAllOrders, fetchResellers]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResellerDropdown(false);
    };

    if (showResellerDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showResellerDropdown]);

  // Filter purchase orders based on search term
  const filteredPurchaseOrders = purchaseOrders.filter(order =>
    order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Count orders by status
  const getStatusCount = (status: StatusType): number => {
    if (status === 'all') return allOrders.length;
    return allOrders.filter(order => order.status === status).length;
  };

  // Handle status tab change
  const handleStatusChange = (status: StatusType) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    
    // Check if there are active filters (excluding status)
    const hasActiveFilters = !!(
      tempFilters.userId || 
      tempFilters.dateFrom || 
      tempFilters.dateTo
    );
    
    // Keep panel open if there are active filters, otherwise close it
    setShowAdvancedFilters(hasActiveFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters: FilterState = { status: 'all' };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setSearchTerm('');
    setResellerSearch('');
    setShowAdvancedFilters(false); // Close panel when reset
  };

  // Remove individual filter
  const removeFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...filters };
    if (filterKey === 'status') {
      newFilters.status = 'all';
    } else {
      delete newFilters[filterKey];
    }
    setFilters(newFilters);
    setTempFilters(newFilters);
    
    // Reset reseller search if removing userId filter
    if (filterKey === 'userId') {
      setResellerSearch('');
    }
    
    // Close panel if no more filters active (excluding status)
    const hasActiveFilters = !!(newFilters.userId || newFilters.dateFrom || newFilters.dateTo);
    setShowAdvancedFilters(hasActiveFilters);
  };

  // Get active filters count (excluding status 'all')
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.userId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  };

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
      received: 'bg-teal-100 text-teal-800',
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
          <div className="flex gap-3">
            <ViewDeletedButton
              onClick={() => setShowDeletedModal(true)}
              itemName="Purchase Orders"
            />
            <button
              onClick={() => router.push('/dashboard/purchase-orders/create')}
              className="flex items-center gap-2 px-4 py-2 border border-indigo-600 rounded-lg text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create PO with Items
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quick Create PO
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
            {(['all', 'draft', 'submitted', 'approved', 'received', 'closed'] as StatusType[]).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filters.status === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="capitalize">{status}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  filters.status === status
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by PO Number, User, Status, or Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                  showAdvancedFilters || getActiveFiltersCount() > 0
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-xs font-semibold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  fetchPurchaseOrders();
                  fetchAllOrders();
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                title="Refresh data"
              >
                <svg className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Advanced Filters</h3>
                  <button
                    onClick={handleResetFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Reset All
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reseller Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reseller</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={resellerSearch}
                        onChange={(e) => {
                          setResellerSearch(e.target.value);
                          setShowResellerDropdown(true);
                        }}
                        onFocus={() => setShowResellerDropdown(true)}
                        placeholder="Search reseller..."
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {tempFilters.userId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempFilters(prev => ({ ...prev, userId: undefined }));
                            setResellerSearch('');
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Dropdown */}
                    {showResellerDropdown && (
                      <div 
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {resellers
                          .filter(reseller => 
                            reseller?.name?.toLowerCase().includes(resellerSearch.toLowerCase()) ||
                            reseller?.locationName?.toLowerCase().includes(resellerSearch.toLowerCase())
                          )
                          .map((reseller) => (
                            <button
                              key={reseller.locationId}
                              type="button"
                              onClick={() => {
                                setTempFilters(prev => ({ ...prev, userId: reseller.userId }));
                                setResellerSearch(`${reseller.name} - ${reseller.locationName}`);
                                setShowResellerDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                                tempFilters.userId === reseller.userId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                              }`}
                            >
                              <div className="font-medium">{reseller.name}</div>
                              <div className="text-xs text-gray-500">{reseller.locationName}</div>
                            </button>
                          ))}
                        {resellers.filter(reseller => 
                          reseller?.name?.toLowerCase().includes(resellerSearch.toLowerCase()) ||
                          reseller?.locationName?.toLowerCase().includes(resellerSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No resellers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={tempFilters.dateFrom || ''}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                    <input
                      type="date"
                      value={tempFilters.dateTo || ''}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowAdvancedFilters(false);
                      setShowResellerDropdown(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleApplyFilters();
                      setShowResellerDropdown(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Chips */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                
                {filters.status !== 'all' && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    <span className="font-medium">Status:</span>
                    <span className="capitalize">{filters.status}</span>
                    <button
                      onClick={() => removeFilter('status')}
                      className="ml-1 hover:text-indigo-900"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {(filters.dateFrom || filters.dateTo) && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <span className="font-medium">Date:</span>
                    <span>{filters.dateFrom || 'Any'} - {filters.dateTo || 'Today'}</span>
                    <button
                      onClick={() => {
                        removeFilter('dateFrom');
                        removeFilter('dateTo');
                      }}
                      className="ml-1 hover:text-blue-900"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {filters.userId && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    <span className="font-medium">Reseller:</span>
                    <span>{resellers.find(r => r.userId === filters.userId)?.name || `User ID: ${filters.userId}`}</span>
                    <button
                      onClick={() => removeFilter('userId')}
                      className="ml-1 hover:text-purple-900"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
              <div>
                {searchTerm ? (
                  <span>
                    Showing <strong>{filteredPurchaseOrders.length}</strong> of <strong>{purchaseOrders.length}</strong> purchase orders
                  </span>
                ) : (
                  <span>
                    Showing <strong>{purchaseOrders.length}</strong> purchase orders
                  </span>
                )}
              </div>
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
                            onClick={() => router.push(`/dashboard/purchase-orders/${order.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                            title="Edit with Items"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Quick Edit"
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
