'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import ConfirmModal from '@/components/ConfirmModal';
import DeletedInvoicesModal from '@/components/DeletedInvoicesModal';
import ViewDeletedButton from '@/components/ViewDeletedButton';
import InvoiceModal from '@/components/InvoiceModal';
import {
  Invoice,
  getInvoices,
  getInvoiceById,
  filterInvoices,
  deleteInvoice,
  createInvoice,
  updateInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/lib/invoices';
import { PurchaseOrder, getPurchaseOrders } from '@/lib/purchaseOrders';
import { DeliveryOrder, getDeliveryOrders } from '@/lib/deliveryOrders';

type StatusType = 'all' | 'draft' | 'sent' | 'paid' | 'closed';
type ModalMode = 'create' | 'edit' | 'view';

interface FilterState {
  status: StatusType;
  purchaseOrderId?: number;
  deliveryOrderId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [showDODropdown, setShowDODropdown] = useState(false);
  const [poSearch, setPOSearch] = useState('');
  const [doSearch, setDOSearch] = useState('');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
  });

  // Temporary filter state for advanced panel
  const [tempFilters, setTempFilters] = useState<FilterState>({
    status: 'all',
  });

  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const [invoiceModal, setInvoiceModal] = useState<{
    isOpen: boolean;
    mode: ModalMode;
    invoice: Invoice | null;
  }>({
    isOpen: false,
    mode: 'create',
    invoice: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    invoice: Invoice | null;
  }>({
    isOpen: false,
    invoice: null,
  });

  // Fetch all invoices
  const fetchAllInvoices = useCallback(async () => {
    try {
      const data = await getInvoices();
      setAllInvoices(data);
    } catch (error) {
      console.error('Error fetching all invoices:', error);
    }
  }, []);

  // Fetch purchase orders for dropdown
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      const response = await getPurchaseOrders();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setPurchaseOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      showAlert('Failed to fetch purchase orders', 'error');
    }
  }, [showAlert]);

  // Fetch delivery orders for dropdown
  const fetchDeliveryOrders = useCallback(async () => {
    try {
      const response = await getDeliveryOrders();
      if (response.code === 200 && response.data && Array.isArray(response.data)) {
        setDeliveryOrders(response.data);
      }
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      showAlert('Failed to fetch delivery orders', 'error');
    }
  }, [showAlert]);

  // Fetch invoices with filters
  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoices();
      
      // Apply client-side filtering
      const filtered = filterInvoices(data, {
        search: searchTerm,
        purchaseOrderId: filters.purchaseOrderId,
        deliveryOrderId: filters.deliveryOrderId,
        startDate: filters.dateFrom,
        endDate: filters.dateTo,
        status: filters.status !== 'all' ? filters.status : undefined,
      });
      
      setInvoices(filtered);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      showAlert('Error fetching invoices', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm, showAlert]);

  useEffect(() => {
    fetchAllInvoices();
    fetchPurchaseOrders();
    fetchDeliveryOrders();
  }, [fetchAllInvoices, fetchPurchaseOrders, fetchDeliveryOrders]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPODropdown(false);
      setShowDODropdown(false);
    };

    if (showPODropdown || showDODropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPODropdown, showDODropdown]);

  // Count invoices by status
  const getStatusCount = (status: StatusType): number => {
    if (status === 'all') return allInvoices.length;
    return allInvoices.filter(invoice => invoice.status === status).length;
  };

  // Handle status tab change
  const handleStatusChange = (status: StatusType) => {
    setFilters(prev => ({ ...prev, status }));
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    
    const hasActiveFilters = !!(
      tempFilters.purchaseOrderId || 
      tempFilters.deliveryOrderId ||
      tempFilters.dateFrom || 
      tempFilters.dateTo
    );
    
    setShowAdvancedFilters(hasActiveFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    const resetFilters: FilterState = { status: 'all' };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setSearchTerm('');
    setPOSearch('');
    setDOSearch('');
    setShowAdvancedFilters(false);
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
    
    if (filterKey === 'purchaseOrderId') {
      setPOSearch('');
    }
    if (filterKey === 'deliveryOrderId') {
      setDOSearch('');
    }
    
    const hasActiveFilters = !!(newFilters.purchaseOrderId || newFilters.deliveryOrderId || newFilters.dateFrom || newFilters.dateTo);
    setShowAdvancedFilters(hasActiveFilters);
  };

  // Get active filters count
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.purchaseOrderId) count++;
    if (filters.deliveryOrderId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  };

  // Handle delete invoice
  const handleDelete = (invoice: Invoice) => {
    setDeleteConfirm({
      isOpen: true,
      invoice,
    });
  };

  // Handle create invoice
  const handleCreate = () => {
    setInvoiceModal({
      isOpen: true,
      mode: 'create',
      invoice: null,
    });
  };

  // Handle view invoice
  const handleView = async (invoice: Invoice) => {
    try {
      const data = await getInvoiceById(invoice.id);
      setInvoiceModal({
        isOpen: true,
        mode: 'view',
        invoice: data,
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showAlert('Error fetching invoice details', 'error');
    }
  };

  // Handle edit invoice
  const handleEdit = async (invoice: Invoice) => {
    try {
      const data = await getInvoiceById(invoice.id);
      setInvoiceModal({
        isOpen: true,
        mode: 'edit',
        invoice: data,
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showAlert('Error fetching invoice details', 'error');
    }
  };

  // Handle modal save
  const handleModalSave = async (data: CreateInvoiceRequest | UpdateInvoiceRequest) => {
    try {
      if (invoiceModal.mode === 'create') {
        await createInvoice(data as CreateInvoiceRequest);
        showAlert('Invoice created successfully', 'success');
      } else if (invoiceModal.mode === 'edit' && invoiceModal.invoice) {
        await updateInvoice(invoiceModal.invoice.id, data as UpdateInvoiceRequest);
        showAlert('Invoice updated successfully', 'success');
      }
      
      setInvoiceModal({ isOpen: false, mode: 'create', invoice: null });
      await fetchInvoices();
      await fetchAllInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw error;
    }
  };

  // Handle view details
  const handleViewDetails = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.invoice) return;

    try {
      await deleteInvoice(deleteConfirm.invoice.id);
      showAlert('Invoice deleted successfully', 'success');
      setDeleteConfirm({ isOpen: false, invoice: null });
      await fetchInvoices();
      await fetchAllInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showAlert('Error deleting invoice', 'error');
    }
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
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
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
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage invoices and track their status
            </p>
          </div>
          <div className="flex gap-3">
            <ViewDeletedButton
              onClick={() => setShowDeletedModal(true)}
              itemName="Invoices"
            />
            <button
              onClick={() => router.push('/dashboard/invoices/create')}
              className="flex items-center gap-2 px-4 py-2 border border-indigo-600 rounded-lg text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Create Invoice with Items
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Quick Create Invoice
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
            {(['all', 'draft', 'sent', 'paid', 'closed'] as StatusType[]).map((status) => (
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
                    placeholder="Search by Invoice Number, PO Number, DO Number, Status, or Description..."
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

              {/* Filters Button */}
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
                  fetchInvoices();
                  fetchAllInvoices();
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
                  {/* Purchase Order Filter */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={poSearch}
                        onChange={(e) => {
                          setPOSearch(e.target.value);
                          setShowPODropdown(true);
                        }}
                        onFocus={() => setShowPODropdown(true)}
                        placeholder="Search purchase order..."
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {tempFilters.purchaseOrderId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempFilters(prev => ({ ...prev, purchaseOrderId: undefined }));
                            setPOSearch('');
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
                    {showPODropdown && (
                      <div 
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {purchaseOrders
                          .filter(po => 
                            po?.poNumber?.toLowerCase().includes(poSearch.toLowerCase())
                          )
                          .map((po) => (
                            <button
                              key={po.id}
                              type="button"
                              onClick={() => {
                                setTempFilters(prev => ({ ...prev, purchaseOrderId: po.id }));
                                setPOSearch(po.poNumber);
                                setShowPODropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                                tempFilters.purchaseOrderId === po.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                              }`}
                            >
                              <div className="font-medium">{po.poNumber}</div>
                            </button>
                          ))}
                        {purchaseOrders.filter(po => 
                          po?.poNumber?.toLowerCase().includes(poSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No purchase orders found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delivery Order Filter */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Order</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={doSearch}
                        onChange={(e) => {
                          setDOSearch(e.target.value);
                          setShowDODropdown(true);
                        }}
                        onFocus={() => setShowDODropdown(true)}
                        placeholder="Search delivery order..."
                        className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {tempFilters.deliveryOrderId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempFilters(prev => ({ ...prev, deliveryOrderId: undefined }));
                            setDOSearch('');
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
                    {showDODropdown && (
                      <div 
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deliveryOrders
                          .filter(d => 
                            d?.doNumber?.toLowerCase().includes(doSearch.toLowerCase())
                          )
                          .map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                setTempFilters(prev => ({ ...prev, deliveryOrderId: d.id }));
                                setDOSearch(d.doNumber);
                                setShowDODropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                                tempFilters.deliveryOrderId === d.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                              }`}
                            >
                              <div className="font-medium">{d.doNumber}</div>
                            </button>
                          ))}
                        {deliveryOrders.filter(d => 
                          d?.doNumber?.toLowerCase().includes(doSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500 text-center">
                            No delivery orders found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                    <input
                      type="date"
                      value={tempFilters.dateFrom || ''}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Date To */}
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
                      setShowPODropdown(false);
                      setShowDODropdown(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                    Status: {filters.status}
                    <button
                      onClick={() => removeFilter('status')}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.purchaseOrderId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                    PO: {purchaseOrders.find(po => po.id === filters.purchaseOrderId)?.poNumber}
                    <button
                      onClick={() => removeFilter('purchaseOrderId')}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {filters.deliveryOrderId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                    DO: {deliveryOrders.find(d => d.id === filters.deliveryOrderId)?.doNumber}
                    <button
                      onClick={() => removeFilter('deliveryOrderId')}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                    Date: {filters.dateFrom || '...'} to {filters.dateTo || '...'}
                    <button
                      onClick={() => {
                        removeFilter('dateFrom');
                        removeFilter('dateTo');
                      }}
                      className="hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading invoices...</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No invoices match your search.' : 'Get started by creating a new invoice.'}
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
                      Create Invoice
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
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        PO Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        DO Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Invoice Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        <div className="flex items-center justify-end space-x-2">
                          <span>Actions</span>
                          <button
                            onClick={fetchInvoices}
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.poNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.doNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {invoice.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                            title="Edit with Items"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Quick Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(invoice)}
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
      </div>

      {/* Modals */}
      <DeletedInvoicesModal
        isOpen={showDeletedModal}
        onClose={() => setShowDeletedModal(false)}
        onRestore={() => {
          fetchInvoices();
          fetchAllInvoices();
        }}
      />

      <InvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, mode: 'create', invoice: null })}
        onSave={handleModalSave}
        invoice={invoiceModal.invoice}
        mode={invoiceModal.mode}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, invoice: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Invoice"
        description={`Are you sure you want to delete invoice ${deleteConfirm.invoice?.invoiceNumber}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </DashboardLayout>
  );
}
