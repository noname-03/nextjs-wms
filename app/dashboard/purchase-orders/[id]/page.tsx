'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import { getPurchaseOrderWithItems, PurchaseOrderWithItems } from '@/lib/purchaseOrders';

export default function PurchaseOrderDetailPage() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const params = useParams();
  const purchaseOrderId = Number(params.id);
  const printRef = useRef<HTMLDivElement>(null);

  // Purchase Order state
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch purchase order details
  const fetchPurchaseOrder = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPurchaseOrderWithItems(purchaseOrderId);
      if (data) {
        setPurchaseOrder(data);
      } else {
        showAlert('Error fetching purchase order', 'error');
        router.push('/dashboard/purchase-orders');
      }
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      showAlert('Error fetching purchase order', 'error');
      router.push('/dashboard/purchase-orders');
    } finally {
      setIsLoading(false);
    }
  }, [purchaseOrderId, showAlert, router]);

  useEffect(() => {
    if (user && purchaseOrderId) {
      fetchPurchaseOrder();
    }
  }, [user, purchaseOrderId, fetchPurchaseOrder]);

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
      month: 'long',
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
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading purchase order...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!purchaseOrder) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">Purchase order not found</h3>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/purchase-orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Purchase Orders
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Print Styles - only visible when printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-page-break {
            page-break-after: always;
          }
          @page {
            margin: 1cm;
            size: A4 portrait;
          }
          table {
            page-break-inside: auto;
            width: 100%;
            font-size: 11px;
          }
          table th,
          table td {
            padding: 8px 4px !important;
            white-space: nowrap;
          }
          table th:nth-child(1),
          table td:nth-child(1) {
            width: 5%;
          }
          table th:nth-child(2),
          table td:nth-child(2) {
            width: 25%;
            white-space: normal;
          }
          table th:nth-child(3),
          table td:nth-child(3) {
            width: 8%;
          }
          table th:nth-child(4),
          table td:nth-child(4) {
            width: 15%;
          }
          table th:nth-child(5),
          table td:nth-child(5) {
            width: 12%;
          }
          table th:nth-child(6),
          table td:nth-child(6) {
            width: 15%;
          }
          table th:nth-child(7),
          table td:nth-child(7) {
            width: 20%;
            white-space: normal;
          }
          tfoot td {
            font-size: 12px !important;
            font-weight: bold;
          }
          .print-currency {
            font-size: 10px;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header with Back Button - No Print */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/purchase-orders')}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              title="Back to purchase orders"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{purchaseOrder.poNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Purchase Order Details
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(purchaseOrder.status)}
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              title="Print Purchase Order"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-area" ref={printRef}>
          {/* Print Header */}
          <div className="hidden print:block mb-8">
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">PURCHASE ORDER</h1>
              <p className="text-sm text-gray-600 mt-2">Document No: {purchaseOrder.poNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">COMPANY INFORMATION</h3>
                <p className="text-sm text-gray-700">Your Company Name</p>
                <p className="text-sm text-gray-600">Address Line 1</p>
                <p className="text-sm text-gray-600">City, State, ZIP</p>
                <p className="text-sm text-gray-600">Phone: (123) 456-7890</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">VENDOR INFORMATION</h3>
                <p className="text-sm text-gray-700 font-medium">{purchaseOrder.userName}</p>
                <p className="text-sm text-gray-600">Vendor ID: {purchaseOrder.userId}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Order Date:</span>
                <p className="text-gray-900">{formatDate(purchaseOrder.orderDate)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <p className="text-gray-900 uppercase">{purchaseOrder.status}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Created:</span>
                <p className="text-gray-900">{formatDate(purchaseOrder.createdAt)}</p>
              </div>
            </div>
          </div>

        {/* Purchase Order Info Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden print:shadow-none print:border-0">
          <div className="px-6 py-5 border-b border-gray-200 no-print">
            <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
          </div>
          <div className="px-6 py-5 print:hidden">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">PO Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{purchaseOrder.poNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(purchaseOrder.orderDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">{getStatusBadge(purchaseOrder.status)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">{formatPrice(purchaseOrder.totalAmount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">{purchaseOrder.userName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(purchaseOrder.createdAt)}</dd>
              </div>
              {purchaseOrder.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{purchaseOrder.description}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Purchase Order Items */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden print:shadow-none print:border-0">
          <div className="px-6 py-5 border-b border-gray-200 no-print">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {purchaseOrder.items?.length || 0} item(s) in this purchase order
                </p>
              </div>
            </div>
          </div>
          
          {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
            <>
              {/* Print Table Header */}
              <div className="hidden print:block mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>

              {/* Desktop Table */}
              <div className="overflow-x-auto print:block">
                <table className="min-w-full divide-y divide-gray-200 print:border print:border-gray-300">
                  <thead className="bg-gray-50 print:bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Product
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Total Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:border print:border-gray-300">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrder.items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 print:hover:bg-white">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:border print:border-gray-300">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap print:border print:border-gray-300">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500 print:hidden">ID: {item.productId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 print:border print:border-gray-300">
                          {item.qtyOrdered.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 print:border print:border-gray-300">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 print:border print:border-gray-300">
                          {formatPrice(item.discount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 print:border print:border-gray-300">
                          {formatPrice(item.totalPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 print:border print:border-gray-300">
                          {item.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 print:bg-gray-100">
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-right text-sm font-medium text-gray-900 print:border print:border-gray-300">
                        Total Amount:
                      </td>
                      <td className="px-6 py-4 text-right text-lg font-bold text-indigo-600 print:text-gray-900 print:border print:border-gray-300">
                        {formatPrice(purchaseOrder.totalAmount)}
                      </td>
                      <td className="print:border print:border-gray-300"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-200 print:hidden">
                {purchaseOrder.items.map((item, index) => (
                  <div key={item.id} className="px-6 py-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}. {item.productName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Product ID: {item.productId}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <div className="font-medium text-gray-900 mt-1">
                          {item.qtyOrdered.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Price:</span>
                        <div className="font-medium text-gray-900 mt-1">
                          {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Discount:</span>
                        <div className="font-medium text-gray-900 mt-1">
                          {formatPrice(item.discount)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <div className="font-semibold text-indigo-600 mt-1">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
                    </div>
                    
                    {item.description && (
                      <div className="text-sm">
                        <span className="text-gray-500">Note:</span>
                        <div className="text-gray-900 mt-1">{item.description}</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Mobile Total */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatPrice(purchaseOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-6 py-12">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This purchase order doesn't have any items yet.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Print Footer - Only visible when printing */}
        <div className="hidden print:block mt-12 pt-8 border-t-2 border-gray-300">
          {purchaseOrder.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h3>
              <p className="text-sm text-gray-700">{purchaseOrder.description}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Payment terms: Net 30 days from invoice date</li>
              <li>Delivery should be made within 7-14 business days</li>
              <li>All items must be in good condition upon delivery</li>
              <li>Please include this PO number on all invoices and correspondence</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="border-t-2 border-gray-800 pt-2 mt-12 mx-8">
                <p className="text-sm font-semibold text-gray-900">Prepared By</p>
                <p className="text-xs text-gray-600 mt-1">{purchaseOrder.userName}</p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-gray-800 pt-2 mt-12 mx-8">
                <p className="text-sm font-semibold text-gray-900">Approved By</p>
                <p className="text-xs text-gray-600 mt-1">Manager</p>
              </div>
            </div>
            <div>
              <div className="border-t-2 border-gray-800 pt-2 mt-12 mx-8">
                <p className="text-sm font-semibold text-gray-900">Received By</p>
                <p className="text-xs text-gray-600 mt-1">Vendor</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>Printed on: {new Date().toLocaleDateString('id-ID', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div> {/* End Printable Area */}

        {/* Actions - No Print */}
        <div className="flex justify-end space-x-3 no-print">
          <button
            onClick={() => router.push('/dashboard/purchase-orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to List
          </button>
          <button
            onClick={() => router.push(`/dashboard/purchase-orders/${purchaseOrder.id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Order
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
