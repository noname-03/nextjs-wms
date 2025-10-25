'use client';

import { useState, useEffect } from 'react';
import { Invoice, CreateInvoiceRequest, UpdateInvoiceRequest } from '@/lib/invoices';
import { PurchaseOrder, getPurchaseOrders } from '@/lib/purchaseOrders';
import { DeliveryOrder, getDeliveryOrders } from '@/lib/deliveryOrders';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: CreateInvoiceRequest | UpdateInvoiceRequest) => Promise<void>;
  invoice?: Invoice | null;
  mode: 'create' | 'edit' | 'view';
}

export default function InvoiceModal({ isOpen, onClose, onSave, invoice, mode }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    InvoiceNumber: '',
    PurchaseOrderID: 0,
    UserID: 1,
    DeliveryOrderID: null as number | null,
    InvoiceDate: '',
    Status: 'draft',
    TotalAmount: 0,
    Description: '',
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isPoDropdownOpen, setIsPoDropdownOpen] = useState(false);
  const [isDoDropdownOpen, setIsDoDropdownOpen] = useState(false);
  const [poSearchTerm, setPoSearchTerm] = useState('');
  const [doSearchTerm, setDoSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPurchaseOrders();
      fetchDeliveryOrders();
      
      if (mode === 'edit' && invoice) {
        setFormData({
          InvoiceNumber: invoice.invoiceNumber,
          PurchaseOrderID: invoice.purchaseOrderId,
          UserID: invoice.userId,
          DeliveryOrderID: invoice.deliveryOrderId,
          InvoiceDate: invoice.invoiceDate.split('T')[0],
          Status: invoice.status,
          TotalAmount: invoice.totalAmount,
          Description: invoice.description || '',
        });
        setPoSearchTerm(invoice.poNumber || '');
        setDoSearchTerm(invoice.doNumber || '');
      } else if (mode === 'view' && invoice) {
        setFormData({
          InvoiceNumber: invoice.invoiceNumber,
          PurchaseOrderID: invoice.purchaseOrderId,
          UserID: invoice.userId,
          DeliveryOrderID: invoice.deliveryOrderId,
          InvoiceDate: invoice.invoiceDate.split('T')[0],
          Status: invoice.status,
          TotalAmount: invoice.totalAmount,
          Description: invoice.description || '',
        });
        setPoSearchTerm(invoice.poNumber || '');
        setDoSearchTerm(invoice.doNumber || '');
      } else {
        setFormData({
          InvoiceNumber: '',
          PurchaseOrderID: 0,
          UserID: 1,
          DeliveryOrderID: null,
          InvoiceDate: new Date().toISOString().split('T')[0],
          Status: 'draft',
          TotalAmount: 0,
          Description: '',
        });
        setPoSearchTerm('');
        setDoSearchTerm('');
      }
      setError('');
    }
  }, [isOpen, invoice, mode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsPoDropdownOpen(false);
      setIsDoDropdownOpen(false);
    };

    if (isPoDropdownOpen || isDoDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isPoDropdownOpen, isDoDropdownOpen]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await getPurchaseOrders();
      if (response.data && Array.isArray(response.data)) {
        setPurchaseOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    }
  };

  const fetchDeliveryOrders = async () => {
    try {
      const response = await getDeliveryOrders();
      if (response.data && Array.isArray(response.data)) {
        setDeliveryOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch delivery orders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.InvoiceNumber.trim()) {
      setError('Invoice Number is required');
      return;
    }

    if (!formData.PurchaseOrderID) {
      setError('Purchase Order is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(poSearchTerm.toLowerCase())
  );

  const filteredDeliveryOrders = deliveryOrders.filter(d =>
    d.doNumber.toLowerCase().includes(doSearchTerm.toLowerCase())
  );

  const selectedPO = purchaseOrders.find(po => po.id === formData.PurchaseOrderID);
  const selectedDO = deliveryOrders.find(d => d.id === formData.DeliveryOrderID);

  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const getTitle = () => {
    if (isViewMode) return 'View Invoice';
    if (isEditMode) return 'Edit Invoice';
    return 'Create New Invoice';
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 99999 }}>
      {/* Background overlay */}
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
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Invoice Number */}
            <div>
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                id="invoiceNumber"
                name="invoiceNumber"
                autoComplete="off"
                value={formData.InvoiceNumber}
                onChange={(e) => setFormData({ ...formData, InvoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                placeholder="e.g., INV-2025-001"
                disabled={isLoading || isViewMode}
                required
              />
            </div>

            {/* Purchase Order */}
            <div>
              <label htmlFor="purchaseOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Order *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={poSearchTerm}
                  onChange={(e) => {
                    setPoSearchTerm(e.target.value);
                    setIsPoDropdownOpen(true);
                  }}
                  onFocus={() => !isViewMode && setIsPoDropdownOpen(true)}
                  onClick={(e) => {
                    if (!isViewMode) {
                      e.stopPropagation();
                      setIsPoDropdownOpen(true);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                  placeholder="Search purchase order..."
                  disabled={isLoading || isViewMode}
                  autoComplete="off"
                />
                {isPoDropdownOpen && !isViewMode && filteredPurchaseOrders.length > 0 && (
                  <div 
                    className="absolute z-[100000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filteredPurchaseOrders.map((po) => (
                      <div
                        key={po.id}
                        onClick={() => {
                          setFormData({ ...formData, PurchaseOrderID: po.id });
                          setPoSearchTerm(po.poNumber);
                          setIsPoDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">{po.poNumber}</div>
                        <div className="text-xs text-gray-500">
                          Date: {new Date(po.orderDate).toLocaleDateString('id-ID')} | Status: {po.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedPO && (
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {selectedPO.poNumber} - {new Date(selectedPO.orderDate).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>

            {/* Delivery Order */}
            <div>
              <label htmlFor="deliveryOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Order (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={doSearchTerm}
                  onChange={(e) => {
                    setDoSearchTerm(e.target.value);
                    setIsDoDropdownOpen(true);
                  }}
                  onFocus={() => !isViewMode && setIsDoDropdownOpen(true)}
                  onClick={(e) => {
                    if (!isViewMode) {
                      e.stopPropagation();
                      setIsDoDropdownOpen(true);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                  placeholder="Search delivery order (optional)..."
                  disabled={isLoading || isViewMode}
                  autoComplete="off"
                />
                {isDoDropdownOpen && !isViewMode && (
                  <div 
                    className="absolute z-[100000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      onClick={() => {
                        setFormData({ ...formData, DeliveryOrderID: null });
                        setDoSearchTerm('');
                        setIsDoDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-500 text-sm">No Delivery Order</div>
                    </div>
                    {filteredDeliveryOrders.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setFormData({ ...formData, DeliveryOrderID: d.id });
                          setDoSearchTerm(d.doNumber);
                          setIsDoDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">{d.doNumber}</div>
                        <div className="text-xs text-gray-500">PO: {d.poNumber}</div>
                      </div>
                    ))}
                    {filteredDeliveryOrders.length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-xs text-center">No delivery orders found</div>
                    )}
                  </div>
                )}
              </div>
              {selectedDO && (
                <p className="mt-1 text-xs text-gray-500">
                  Selected: {selectedDO.doNumber} - PO: {selectedDO.poNumber}
                </p>
              )}
            </div>

            {/* Invoice Date and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={formData.InvoiceDate}
                  onChange={(e) => setFormData({ ...formData, InvoiceDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                  disabled={isLoading || isViewMode}
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.Status}
                  onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                  disabled={isLoading || isViewMode}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount *
              </label>
              <input
                type="number"
                id="totalAmount"
                name="totalAmount"
                value={formData.TotalAmount}
                onChange={(e) => setFormData({ ...formData, TotalAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                placeholder="0"
                disabled={isLoading || isViewMode}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white border-gray-300 focus:border-indigo-500"
                placeholder="Enter description..."
                disabled={isLoading || isViewMode}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    mode === 'create' ? 'Create Invoice' : 'Update Invoice'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
