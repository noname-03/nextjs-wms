'use client';

import { useState, useEffect } from 'react';
import {
  PurchaseOrder,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
} from '@/lib/purchaseOrders';

type ModalMode = 'create' | 'edit' | 'view';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePurchaseOrderData | UpdatePurchaseOrderData) => Promise<void>;
  purchaseOrder?: PurchaseOrder;
  mode: ModalMode;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  onSave,
  purchaseOrder,
  mode,
  isLoading = false,
}: PurchaseOrderModalProps) {
  const [formData, setFormData] = useState({
    poNumber: '',
    userId: 1,
    orderDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    totalAmount: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (isOpen) {
      if (purchaseOrder && (isEditMode || isViewMode)) {
        setFormData({
          poNumber: purchaseOrder.poNumber,
          userId: purchaseOrder.userId,
          orderDate: purchaseOrder.orderDate.split('T')[0],
          status: purchaseOrder.status,
          totalAmount: purchaseOrder.totalAmount,
          description: purchaseOrder.description || '',
        });
      } else if (isCreateMode) {
        setFormData({
          poNumber: '',
          userId: 1,
          orderDate: new Date().toISOString().split('T')[0],
          status: 'draft',
          totalAmount: 0,
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, purchaseOrder, mode, isEditMode, isViewMode, isCreateMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalAmount' || name === 'userId' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.poNumber.trim()) {
      newErrors.poNumber = 'PO Number is required';
    }
    if (!formData.orderDate) {
      newErrors.orderDate = 'Order Date is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'Total Amount cannot be negative';
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
        poNumber: formData.poNumber,
        userId: formData.userId,
        orderDate: formData.orderDate,
        status: formData.status,
        totalAmount: formData.totalAmount,
        ...(formData.description && { description: formData.description }),
      };

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving purchase order:', error);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (isViewMode) return 'View Purchase Order';
    if (isEditMode) return 'Edit Purchase Order';
    return 'Create New Purchase Order';
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
          {isViewMode && purchaseOrder ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{purchaseOrder.poNumber}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(purchaseOrder.orderDate).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">
                    {purchaseOrder.status}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  }).format(purchaseOrder.totalAmount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{purchaseOrder.userName}</p>
              </div>
              {purchaseOrder.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                    {purchaseOrder.description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* PO Number */}
              <div>
                <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  PO Number *
                </label>
                <input
                  type="text"
                  id="poNumber"
                  name="poNumber"
                  autoComplete="off"
                  value={formData.poNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.poNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="e.g., PO-2025-001"
                  disabled={isLoading}
                  required
                />
                {errors.poNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.poNumber}</p>
                )}
              </div>

              {/* Order Date and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    id="orderDate"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                      errors.orderDate 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {errors.orderDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.orderDate}</p>
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

              {/* Total Amount */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (IDR)
                </label>
                <input
                  type="number"
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.totalAmount 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="0"
                  disabled={isLoading}
                />
                {errors.totalAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>
                )}
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
                    isCreateMode ? 'Create Purchase Order' : 'Update Purchase Order'
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
