'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { createDeliveryOrderWithItems, DeliveryOrderItem } from '@/lib/deliveryOrders';
import { getProducts, Product } from '@/lib/products';
import { getPurchaseOrders, PurchaseOrder } from '@/lib/purchaseOrders';

interface DOFormData {
  doNumber: string;
  purchaseOrderId: number;
  deliveryDate: string;
  status: 'draft' | 'shipped' | 'delivered' | 'closed';
  description: string;
}

interface DOItemForm extends DeliveryOrderItem {
  id: string; // Temporary ID for React key
  productName?: string;
}

export default function CreateDeliveryOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poSearch, setPOSearch] = useState('');
  const [showPODropdown, setShowPODropdown] = useState(false);

  // DO Form Data
  const [formData, setFormData] = useState<DOFormData>({
    doNumber: '',
    purchaseOrderId: 0,
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    description: '',
  });

  // DO Items
  const [items, setItems] = useState<DOItemForm[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<{ [key: string]: string }>({});

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch products and purchase orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, poResponse] = await Promise.all([
          getProducts(),
          getPurchaseOrders(),
        ]);
        
        // Extract products from response
        if (productsResponse.code === 200 && productsResponse.data) {
          const productsArray = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : [productsResponse.data];
          setProducts(productsArray);
        }
        
        // Extract purchase orders from response
        if (poResponse.code === 200 && poResponse.data && Array.isArray(poResponse.data)) {
          setPurchaseOrders(poResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load data', 'error');
      }
    };
    fetchData();
  }, [showAlert]);

  // Add new item row
  const addItem = () => {
    const newItem: DOItemForm = {
      id: Date.now().toString(),
      productId: 0,
      qtyDelivered: 1,
      description: '',
    };
    setItems([...items, newItem]);
  };

  // Remove item row
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Update item
  const updateItem = (id: string, field: keyof DOItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
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

    if (!formData.doNumber.trim()) {
      newErrors.doNumber = 'DO Number is required';
    }
    if (!formData.purchaseOrderId || formData.purchaseOrderId === 0) {
      newErrors.purchaseOrderId = 'Purchase Order is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery Date is required';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate items
    items.forEach((item, index) => {
      if (!item.productId || item.productId === 0) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.qtyDelivered || item.qtyDelivered <= 0) {
        newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0';
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
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          qtyDelivered: item.qtyDelivered,
          description: item.description,
        })),
      };

      const response = await createDeliveryOrderWithItems(data);

      if (response.code === 200 || response.code === 201) {
        showAlert('Delivery order created successfully', 'success');
        router.push('/dashboard/delivery-orders');
      } else {
        showAlert(response.message || 'Failed to create delivery order', 'error');
      }
    } catch (error) {
      console.error('Error creating delivery order:', error);
      showAlert('An error occurred while creating delivery order', 'error');
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProductDropdown(null);
      setShowPODropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Delivery Order</h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to create a new delivery order with items
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
          {/* DO Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* DO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DO Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.doNumber}
                  onChange={(e) => setFormData({ ...formData, doNumber: e.target.value })}
                  placeholder="DO-2024-001"
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.doNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.doNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.doNumber}</p>
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
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                          formData.purchaseOrderId === po.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{po.poNumber}</div>
                        <div className="text-xs text-gray-500">{po.userName}</div>
                      </button>
                    ))}
                    {getFilteredPurchaseOrders().length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No purchase orders found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.deliveryDate}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Delivery Order Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                + Add Item
              </button>
            </div>

            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            {/* Items Table - Desktop */}
            <div className="hidden lg:block overflow-x-auto min-h-[400px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                      Product
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Qty Delivered
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-gray-500">
                        No items added yet. Click "Add Item" to start.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-3">
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={productSearch[item.id] || ''}
                              onChange={(e) => {
                                setProductSearch({ ...productSearch, [item.id]: e.target.value });
                                setShowProductDropdown(item.id);
                              }}
                              onFocus={() => setShowProductDropdown(item.id)}
                              placeholder="Search product..."
                              className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {showProductDropdown === item.id && (
                              <div
                                className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-xl max-h-60 overflow-y-auto"
                                style={{ minWidth: '250px' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {getFilteredProducts(item.id).map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => selectProduct(item.id, product)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900"
                                  >
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-gray-500">
                                      {product.categoryName} - {product.brandName}
                                    </div>
                                  </button>
                                ))}
                                {getFilteredProducts(item.id).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No products found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.qtyDelivered}
                            onChange={(e) => updateItem(item.id, 'qtyDelivered', parseInt(e.target.value) || 0)}
                            className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Optional note..."
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Items Cards - Mobile/Tablet */}
            <div className="lg:hidden space-y-4">
              {items.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  No items added yet. Click "Add Item" to start.
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3 min-h-[350px]">
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                      <input
                        type="text"
                        value={productSearch[item.id] || ''}
                        onChange={(e) => {
                          setProductSearch({ ...productSearch, [item.id]: e.target.value });
                          setShowProductDropdown(item.id);
                        }}
                        onFocus={() => setShowProductDropdown(item.id)}
                        placeholder="Search product..."
                        className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
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
                              className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-900"
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                {product.categoryName} - {product.brandName}
                              </div>
                            </button>
                          ))}
                          {getFilteredProducts(item.id).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                              No products found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Delivered *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qtyDelivered}
                        onChange={(e) => updateItem(item.id, 'qtyDelivered', parseInt(e.target.value) || 0)}
                        className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Optional note..."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Delivery Order'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
