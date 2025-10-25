'use client';

import { useState, useEffect } from 'react';
import {
  DeliveryOrder,
  CreateDeliveryOrderData,
  UpdateDeliveryOrderData,
} from '@/lib/deliveryOrders';
import { PurchaseOrder, getPurchaseOrders } from '@/lib/purchaseOrders';

type ModalMode = 'create' | 'edit' | 'view';

interface DeliveryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateDeliveryOrderData | UpdateDeliveryOrderData) => Promise<void>;
  deliveryOrder?: DeliveryOrder;
  mode: ModalMode;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'closed', label: 'Closed' },
];

export default function DeliveryOrderModal({
  isOpen,
  onClose,
  onSave,
  deliveryOrder,
  mode,
  isLoading = false,
}: DeliveryOrderModalProps) {
  const [formData, setFormData] = useState({
    doNumber: '',
    purchaseOrderId: 0,
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [poSearch, setPOSearch] = useState('');

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Fetch purchase orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const response = await getPurchaseOrders();
        if (response.code === 200 && Array.isArray(response.data)) {
          setPurchaseOrders(response.data);
        }
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };

    if (isOpen) {
      fetchPurchaseOrders();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (deliveryOrder && (isEditMode || isViewMode)) {
        setFormData({
          doNumber: deliveryOrder.doNumber,
          purchaseOrderId: deliveryOrder.purchaseOrderId,
          deliveryDate: deliveryOrder.deliveryDate.split('T')[0],
          status: deliveryOrder.status,
          description: deliveryOrder.description || '',
        });
        // Set PO search with the PO number
        const po = purchaseOrders.find(p => p.id === deliveryOrder.purchaseOrderId);
        if (po) {
          setPOSearch(po.poNumber);
        }
      } else if (isCreateMode) {
        setFormData({
          doNumber: '',
          purchaseOrderId: 0,
          deliveryDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          description: '',
        });
        setPOSearch('');
      }
      setErrors({});
    }
  }, [isOpen, deliveryOrder, mode, isEditMode, isViewMode, isCreateMode, purchaseOrders]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'purchaseOrderId' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectPO = (po: PurchaseOrder) => {
    setFormData(prev => ({ ...prev, purchaseOrderId: po.id }));
    setPOSearch(po.poNumber);
    setShowPODropdown(false);
    if (errors.purchaseOrderId) {
      setErrors(prev => ({ ...prev, purchaseOrderId: '' }));
    }
  };

  const getFilteredPurchaseOrders = () => {
    return purchaseOrders.filter(po =>
      po.poNumber.toLowerCase().includes(poSearch.toLowerCase())
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.doNumber.trim()) {
      newErrors.doNumber = 'DO Number is required';
    }
    if (!formData.purchaseOrderId || formData.purchaseOrderId === 0) {
      newErrors.purchaseOrderId = 'Purchase Order is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery Date is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isViewMode) {
      onClose();
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const submitData = {
        doNumber: formData.doNumber,
        purchaseOrderId: formData.purchaseOrderId,
        deliveryDate: formData.deliveryDate,
        status: formData.status,
        ...(formData.description && { description: formData.description }),
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving delivery order:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPODropdown(false);
    };

    if (showPODropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPODropdown]);

  if (!isOpen) return null;

  const getTitle = () => {
    if (isViewMode) return 'View Delivery Order';
    if (isEditMode) return 'Edit Delivery Order';
    return 'Create New Delivery Order';
  };

  const selectedPO = purchaseOrders.find(po => po.id === formData.purchaseOrderId);

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
          {isViewMode && deliveryOrder ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DO Number</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{deliveryOrder.doNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{deliveryOrder.poNumber}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(deliveryOrder.deliveryDate).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">
                    {deliveryOrder.status}
                  </p>
                </div>
              </div>
              {deliveryOrder.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                    {deliveryOrder.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DO Number */}
              <div>
                <label htmlFor="doNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  DO Number *
                </label>
                <input
                  type="text"
                  id="doNumber"
                  name="doNumber"
                  autoComplete="off"
                  value={formData.doNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.doNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="e.g., DO-2025-001"
                  disabled={isLoading}
                  required
                />
                {errors.doNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.doNumber}</p>
                )}
              </div>

              {/* Purchase Order Dropdown */}
              <div>
                <label htmlFor="purchaseOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Order *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={poSearch}
                    onChange={(e) => {
                      setPOSearch(e.target.value);
                      setShowPODropdown(true);
                    }}
                    onFocus={() => setShowPODropdown(true)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPODropdown(true);
                    }}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                      errors.purchaseOrderId 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    placeholder="Search purchase order..."
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {showPODropdown && getFilteredPurchaseOrders().length > 0 && (
                    <div 
                      className="absolute z-[100000] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getFilteredPurchaseOrders().map((po) => (
                        <div
                          key={po.id}
                          onClick={() => selectPO(po)}
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
                {errors.purchaseOrderId && (
                  <p className="mt-1 text-sm text-red-600">{errors.purchaseOrderId}</p>
                )}
              </div>

              {/* Delivery Date and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                      errors.deliveryDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {errors.deliveryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.deliveryDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                      errors.status 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    disabled={isLoading}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  autoComplete="off"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  placeholder="Optional description..."
                  disabled={isLoading}
                />
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
                  disabled={isLoading}
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
                    isCreateMode ? 'Create Delivery Order' : 'Update Delivery Order'
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
