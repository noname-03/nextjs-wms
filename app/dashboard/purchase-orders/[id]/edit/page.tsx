'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { getPurchaseOrderWithItems, updatePurchaseOrderWithItems, PurchaseOrderItem } from '@/lib/purchaseOrders';
import { getProducts, Product, ProductResponse } from '@/lib/products';
import { getResellers, Reseller } from '@/lib/resellers';

interface POFormData {
  poNumber: string;
  userId: number;
  orderDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'closed';
  totalAmount: number;
  description: string;
}

interface POItemForm extends PurchaseOrderItem {
  id: string; // Temporary ID for React key
  productName?: string;
}

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = parseInt(params.id as string);
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [resellerSearch, setResellerSearch] = useState('');
  const [showResellerDropdown, setShowResellerDropdown] = useState(false);

  // PO Form Data
  const [formData, setFormData] = useState<POFormData>({
    poNumber: '',
    userId: 0,
    orderDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    totalAmount: 0,
    description: '',
  });

  // PO Items
  const [items, setItems] = useState<POItemForm[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<{ [key: string]: string }>({});

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch initial data (PO, products, resellers)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch PO data, products, and resellers in parallel
        const [poData, productsResponse, resellersData] = await Promise.all([
          getPurchaseOrderWithItems(poId),
          getProducts(),
          getResellers(),
        ]);

        // Handle PO data
        if (poData) {
          // Parse order date to YYYY-MM-DD format for input[type="date"]
          let formattedOrderDate = new Date().toISOString().split('T')[0];
          if (poData.orderDate) {
            try {
              // Handle various date formats (ISO, timestamp, etc.)
              const dateObj = new Date(poData.orderDate);
              if (!isNaN(dateObj.getTime())) {
                formattedOrderDate = dateObj.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Error parsing order date:', e);
            }
          }
          
          // Populate form data
          setFormData({
            poNumber: poData.poNumber || '',
            userId: poData.userId || 0,
            orderDate: formattedOrderDate,
            status: poData.status || 'draft',
            totalAmount: poData.totalAmount || 0,
            description: poData.description || '',
          });

          // Populate items with temporary IDs
          if (poData.items && Array.isArray(poData.items)) {
            const populatedItems: POItemForm[] = poData.items.map((item: any, index: number) => ({
              id: `${Date.now()}-${index}`,
              productId: item.productId || 0,
              productName: item.productName || '',
              qtyOrdered: item.qtyOrdered || 1,
              unitPrice: item.unitPrice || 0,
              discount: item.discount || 0,
              totalPrice: item.totalPrice || 0,
              description: item.description || '',
            }));
            setItems(populatedItems);

            // Pre-populate product search with product names
            const searchMap: { [key: string]: string } = {};
            populatedItems.forEach((item) => {
              if (item.productName) {
                searchMap[item.id] = item.productName;
              }
            });
            setProductSearch(searchMap);
          }

          // Find and set reseller search text
          const reseller = resellersData.find((r: Reseller) => r.userId === poData.userId);
          if (reseller) {
            setResellerSearch(`${reseller.name} - ${reseller.locationName}`);
          }
        } else {
          showAlert('Failed to load purchase order data', 'error');
          router.push('/dashboard/purchase-orders');
          return;
        }

        // Handle products
        if (productsResponse.code === 200 && productsResponse.data) {
          const productsArray = Array.isArray(productsResponse.data) 
            ? productsResponse.data 
            : [productsResponse.data];
          setProducts(productsArray);
        }

        // Set resellers
        setResellers(resellersData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Failed to load data', 'error');
        router.push('/dashboard/purchase-orders');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (poId) {
      fetchInitialData();
    }
  }, [poId, showAlert, router]);

  // Calculate total amount whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  }, [items]);

  // Add new item row
  const addItem = () => {
    const newItem: POItemForm = {
      id: Date.now().toString(),
      productId: 0,
      qtyOrdered: 1,
      unitPrice: 0,
      discount: 0,
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
  const updateItem = (id: string, field: keyof POItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Recalculate total price
        if (field === 'qtyOrdered' || field === 'unitPrice' || field === 'discount') {
          const qty = field === 'qtyOrdered' ? Number(value) : updated.qtyOrdered;
          const price = field === 'unitPrice' ? Number(value) : updated.unitPrice;
          const discount = field === 'discount' ? Number(value) : updated.discount;
          updated.totalPrice = (qty * price) - discount;
        }
        
        return updated;
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
          unitPrice: 0,
          totalPrice: (item.qtyOrdered * 0) - item.discount
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

    if (!formData.poNumber.trim()) {
      newErrors.poNumber = 'PO Number is required';
    }
    if (!formData.userId || formData.userId === 0) {
      newErrors.userId = 'Reseller is required';
    }
    if (!formData.orderDate) {
      newErrors.orderDate = 'Order Date is required';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate items
    items.forEach((item, index) => {
      console.log(`Validating item ${index}:`, {
        productId: item.productId,
        productName: item.productName,
        qtyOrdered: item.qtyOrdered,
        unitPrice: item.unitPrice
      });
      
      if (!item.productId || item.productId === 0) {
        console.log(`Item ${index} - Product ID is invalid or not selected`);
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (!item.qtyOrdered || item.qtyOrdered <= 0) {
        console.log(`Item ${index} - Quantity is invalid`);
        newErrors[`item_${index}_qty`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice === undefined || item.unitPrice === null || item.unitPrice <= 0) {
        console.log(`Item ${index} - Unit price is invalid:`, item.unitPrice);
        newErrors[`item_${index}_price`] = 'Unit price must be greater than 0';
      }
    });

    console.log('Validation errors:', newErrors);
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
          qtyOrdered: item.qtyOrdered,
          unitPrice: item.unitPrice,
          discount: item.discount,
          totalPrice: item.totalPrice,
          description: item.description,
        })),
      };

      const response = await updatePurchaseOrderWithItems(poId, data);

      if (response.code === 200 || response.code === 201) {
        showAlert('Purchase order updated successfully', 'success');
        router.push('/dashboard/purchase-orders');
      } else {
        showAlert(response.message || 'Failed to update purchase order', 'error');
      }
    } catch (error) {
      console.error('Error updating purchase order:', error);
      showAlert('An error occurred while updating purchase order', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format price
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products
  const getFilteredProducts = (itemId: string) => {
    const search = productSearch[itemId] || '';
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  // Filter resellers
  const getFilteredResellers = () => {
    return resellers.filter(r =>
      r.name?.toLowerCase().includes(resellerSearch.toLowerCase()) ||
      r.locationName?.toLowerCase().includes(resellerSearch.toLowerCase())
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProductDropdown(null);
      setShowResellerDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading purchase order data...</p>
            </div>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the details below to modify the purchase order with items
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
          {/* PO Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                  placeholder="PO-2024-001"
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.poNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.poNumber && (
                  <p className="mt-1 text-xs text-red-500">{errors.poNumber}</p>
                )}
              </div>

              {/* Reseller */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reseller <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resellerSearch}
                  onChange={(e) => {
                    setResellerSearch(e.target.value);
                    setShowResellerDropdown(true);
                  }}
                  onFocus={() => setShowResellerDropdown(true)}
                  placeholder="Search reseller..."
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.userId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.userId && (
                  <p className="mt-1 text-xs text-red-500">{errors.userId}</p>
                )}

                {/* Reseller Dropdown */}
                {showResellerDropdown && (
                  <div
                    className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getFilteredResellers().map((reseller) => (
                      <button
                        key={reseller.locationId}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, userId: reseller.userId });
                          setResellerSearch(`${reseller.name} - ${reseller.locationName}`);
                          setShowResellerDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                          formData.userId === reseller.userId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{reseller.name}</div>
                        <div className="text-xs text-gray-500">{reseller.locationName}</div>
                      </button>
                    ))}
                    {getFilteredResellers().length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        No resellers found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.orderDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.orderDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.orderDate}</p>
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
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="received">Received</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Total Amount (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  type="text"
                  value={formatPrice(formData.totalAmount)}
                  readOnly
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-gray-50 cursor-not-allowed"
                />
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
              <h2 className="text-lg font-semibold text-gray-900">Purchase Order Items</h2>
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
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                      Product
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Unit Price
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Discount
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Total
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
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
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
                                className="absolute z-40 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
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
                            value={item.qtyOrdered}
                            onChange={(e) => updateItem(item.id, 'qtyOrdered', parseInt(e.target.value) || 0)}
                            className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                              errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </div>
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
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
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
                          className="absolute z-40 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qtyOrdered}
                          onChange={(e) => updateItem(item.id, 'qtyOrdered', parseInt(e.target.value) || 0)}
                          className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors[`item_${index}_qty`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price *</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={`block w-full px-3 py-2 border rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500 ${
                            errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                      <input
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.totalPrice)}
                      </div>
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
              {isLoading ? 'Updating...' : 'Update Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
