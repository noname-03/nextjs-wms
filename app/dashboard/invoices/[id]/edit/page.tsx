'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { getInvoiceWithItems, updateInvoiceWithItems, InvoiceItem } from '@/lib/invoices';
import { getProducts, Product } from '@/lib/products';
import { getPurchaseOrders, PurchaseOrder } from '@/lib/purchaseOrders';
import { getDeliveryOrders, DeliveryOrder } from '@/lib/deliveryOrders';

interface InvoiceFormData {
  invoiceNumber: string;
  userId: number;
  purchaseOrderId: number;
  deliveryOrderId?: number | null;
  invoiceDate: string;
  status: 'draft' | 'sent' | 'paid' | 'closed';
  totalAmount: number;
  description: string;
}

// Separate form interface for frontend list management
interface InvoiceItemForm {
  id: string; // temporary id for react key
  productId: number;
  productName?: string; // for search display
  qtyInvoiced: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = parseInt(params.id as string);
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [poSearch, setPOSearch] = useState('');
  const [doSearch, setDOSearch] = useState('');
  const [showPODropdown, setShowPODropdown] = useState(false);
  const [showDODropdown, setShowDODropdown] = useState(false);

  // Invoice Form Data
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: '',
    userId: typeof user?.id === 'number' ? user.id : 1,
    purchaseOrderId: 0,
    deliveryOrderId: null,
    invoiceDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    totalAmount: 0,
    description: '',
  });

  // Invoice Items
  const [items, setItems] = useState<InvoiceItemForm[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<{ [key: string]: string }>({});

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch initial data (Invoice, products, purchase orders, delivery orders)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch invoice data, products, purchase orders, and delivery orders in parallel
        const [invoiceData, productsResponse, poResponse, doResponse] = await Promise.all([
          getInvoiceWithItems(invoiceId),
          getProducts(),
          getPurchaseOrders(),
          getDeliveryOrders(),
        ]);

        // Handle Invoice data
        if (invoiceData) {
          // Parse invoice date to YYYY-MM-DD format for input[type="date"]
          let formattedInvoiceDate = new Date().toISOString().split('T')[0];
          if (invoiceData.invoiceDate) {
            try {
              const dateObj = new Date(invoiceData.invoiceDate);
              if (!isNaN(dateObj.getTime())) {
                formattedInvoiceDate = dateObj.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Error parsing invoice date:', e);
            }
          }

          // Populate form data
          setFormData({
            invoiceNumber: invoiceData.invoiceNumber || '',
            userId: invoiceData.userId || (typeof user?.id === 'number' ? user.id : 1),
            purchaseOrderId: invoiceData.purchaseOrderId || 0,
            deliveryOrderId: invoiceData.deliveryOrderId,
            invoiceDate: formattedInvoiceDate,
            status: invoiceData.status as any || 'draft',
            totalAmount: invoiceData.totalAmount || 0,
            description: invoiceData.description || '',
          });

          // Set PO search to show the selected PO number
          setPOSearch(invoiceData.poNumber || '');

          // Set DO search to show the selected DO number if exists
          if (invoiceData.doNumber) {
            setDOSearch(invoiceData.doNumber);
          }

          // Populate items with temporary IDs
          if (invoiceData.items && Array.isArray(invoiceData.items)) {
            const populatedItems: InvoiceItemForm[] = invoiceData.items.map((item: any, index: number) => {
              const tempId = `existing-${index}`;
              const itemData: InvoiceItemForm = {
                id: tempId,
                productId: item.productId || 0,
                productName: item.productName || '',
                qtyInvoiced: item.qtyInvoiced || 1,
                unitPrice: item.unitPrice || 0,
                totalPrice: item.totalPrice || 0,
                description: item.description || '',
              };

              // Set product search text
              if (item.productName) {
                setProductSearch(prev => ({ ...prev, [tempId]: item.productName }));
              }

              return itemData;
            });

            setItems(populatedItems);
          }
        }

        // Handle products
        if (productsResponse.code === 200 && productsResponse.data) {
          const productsArray = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : [productsResponse.data];
          setProducts(productsArray);
        }

        // Handle purchase orders
        if (poResponse.code === 200 && poResponse.data && Array.isArray(poResponse.data)) {
          setPurchaseOrders(poResponse.data);
        }

        // Handle delivery orders
        if (doResponse.code === 200 && doResponse.data && Array.isArray(doResponse.data)) {
          setDeliveryOrders(doResponse.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load invoice data', 'error');
        router.push('/dashboard/invoices');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (invoiceId) {
      fetchInitialData();
    }
  }, [invoiceId, showAlert, router, user?.id]);

  // Calculate total amount whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [items]);

  // Add new item row
  const addItem = () => {
    const newItem: InvoiceItemForm = {
      id: Date.now().toString(),
      productId: 0,
      qtyInvoiced: 1,
      unitPrice: 0,
      totalPrice: 0,
      description: '',
    };
    setItems([...items, newItem]);
  };

  // Remove item row
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Update item
  const updateItem = (id: string, field: keyof InvoiceItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price when qty or unit price changes
        if (field === 'qtyInvoiced' || field === 'unitPrice') {
          updatedItem.totalPrice = (updatedItem.qtyInvoiced || 0) * (updatedItem.unitPrice || 0);
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Select product
  const selectProduct = (itemId: string, product: Product) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          productId: product.id,
          productName: product.name,
        };
      }
      return item;
    }));
    
    setProductSearch(prev => ({ ...prev, [itemId]: product.name }));
    setShowProductDropdown(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice Number is required';
    }
    if (!formData.purchaseOrderId || formData.purchaseOrderId === 0) {
      newErrors.purchaseOrderId = 'Purchase Order is required';
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice Date is required';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.productId || item.productId === 0) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.qtyInvoiced || item.qtyInvoiced <= 0) {
        newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice === undefined || item.unitPrice < 0) {
        newErrors[`item_${index}_price`] = 'Unit price is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        invoiceNumber: formData.invoiceNumber,
        userId: formData.userId,
        purchaseOrderId: formData.purchaseOrderId,
        deliveryOrderId: formData.deliveryOrderId,
        invoiceDate: formData.invoiceDate,
        status: formData.status,
        totalAmount: formData.totalAmount,
        description: formData.description,
        items: items.map(item => ({
          productId: item.productId,
          qtyInvoiced: item.qtyInvoiced,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          description: item.description,
        })),
      };

      await updateInvoiceWithItems(invoiceId, data);
      showAlert('Invoice updated successfully', 'success');
      router.push('/dashboard/invoices');
    } catch (error) {
      console.error('Error updating invoice:', error);
      showAlert(error instanceof Error ? error.message : 'An error occurred while updating invoice', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products
  const getFilteredProducts = (itemId: string) => {
    const search = productSearch[itemId] || '';
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Filter purchase orders
  const getFilteredPurchaseOrders = () => {
    return purchaseOrders.filter(po =>
      po.poNumber?.toLowerCase().includes(poSearch.toLowerCase())
    );
  };

  // Filter delivery orders
  const getFilteredDeliveryOrders = () => {
    return deliveryOrders.filter(d =>
      d.doNumber?.toLowerCase().includes(doSearch.toLowerCase())
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProductDropdown(null);
      setShowPODropdown(false);
      setShowDODropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading invoice data...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update invoice details and items
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-2024-001"
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.invoiceNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.invoiceNumber}</p>
                )}
              </div>

              {/* Purchase Order */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Order <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={poSearch}
                  onChange={(e) => {
                    setPOSearch(e.target.value);
                    setShowPODropdown(true);
                  }}
                  onFocus={() => setShowPODropdown(true)}
                  placeholder="Search purchase order..."
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.purchaseOrderId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.purchaseOrderId && (
                  <p className="mt-1 text-xs text-red-500">{errors.purchaseOrderId}</p>
                )}

                {/* PO Dropdown */}
                {showPODropdown && (
                  <div
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                    style={{ minWidth: '250px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getFilteredPurchaseOrders().map((po) => (
                      <button
                        key={po.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, purchaseOrderId: po.id });
                          setPOSearch(po.poNumber);
                          setShowPODropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{po.poNumber}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(po.orderDate).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                    {getFilteredPurchaseOrders().length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No purchase orders found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Order (Optional) */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Order (Optional)
                </label>
                <input
                  type="text"
                  value={doSearch}
                  onChange={(e) => {
                    setDOSearch(e.target.value);
                    setShowDODropdown(true);
                  }}
                  onFocus={() => setShowDODropdown(true)}
                  placeholder="Search delivery order..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />

                {/* DO Dropdown */}
                {showDODropdown && (
                  <div
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                    style={{ minWidth: '250px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, deliveryOrderId: null });
                        setDOSearch('');
                        setShowDODropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-500">No Delivery Order</div>
                    </button>
                    {getFilteredDeliveryOrders().map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, deliveryOrderId: d.id });
                          setDOSearch(d.doNumber);
                          setShowDODropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{d.doNumber}</div>
                        <div className="text-xs text-gray-500">{d.poNumber}</div>
                      </button>
                    ))}
                    {getFilteredDeliveryOrders().length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">No delivery orders found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.invoiceDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.invoiceDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.invoiceDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Total Amount (Read-only, auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount (Auto-calculated)
                </label>
                <input
                  type="text"
                  value={`Rp ${formData.totalAmount.toLocaleString('id-ID')}`}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50 font-semibold"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Additional notes or description..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Invoice Items Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
                <p className="text-sm text-gray-500">Manage products and quantities for this invoice</p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No items added</h3>
                <p className="mt-1 text-sm text-gray-500">Click "Add Item" to add products to this invoice</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Item #{index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Product */}
                      <div className="lg:col-span-2 relative" onClick={(e) => e.stopPropagation()}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={productSearch[item.id] || ''}
                          onChange={(e) => {
                            setProductSearch({ ...productSearch, [item.id]: e.target.value });
                            setShowProductDropdown(item.id);
                          }}
                          onFocus={() => setShowProductDropdown(item.id)}
                          placeholder="Search product..."
                          className={`block w-full px-3 py-2 border rounded-md text-sm bg-white ${
                            errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`item_${index}_product`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_product`]}</p>
                        )}

                        {/* Product Dropdown */}
                        {showProductDropdown === item.id && (
                          <div
                            className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getFilteredProducts(item.id).map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectProduct(item.id, product)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500">
                                  {product.categoryName && `Category: ${product.categoryName}`}
                                </div>
                              </button>
                            ))}
                            {getFilteredProducts(item.id).length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.qtyInvoiced || ''}
                          onChange={(e) => updateItem(item.id, 'qtyInvoiced', parseFloat(e.target.value) || 0)}
                          min="1"
                          className={`block w-full px-3 py-2 border rounded-md text-sm ${
                            errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`item_${index}_qty`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_qty`]}</p>
                        )}
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          className={`block w-full px-3 py-2 border rounded-md text-sm ${
                            errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`item_${index}_price`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`item_${index}_price`]}</p>
                        )}
                      </div>

                      {/* Total Price (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Price
                        </label>
                        <input
                          type="text"
                          value={`Rp ${(item.totalPrice || 0).toLocaleString('id-ID')}`}
                          readOnly
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 font-semibold"
                        />
                      </div>

                      {/* Description */}
                      <div className="lg:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Note
                        </label>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Additional note for this item..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Invoice'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
