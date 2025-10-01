'use client';

import { useState, useEffect } from 'react';
import { Category, getDeletedCategories, restoreCategory } from '@/lib/categories';
import { useAlert } from '@/components/AlertProvider';
import ConfirmModal from '@/components/ConfirmModal';

interface DeletedCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore?: () => void;
}

export default function DeletedCategoriesModal({ isOpen, onClose, onRestore }: DeletedCategoriesModalProps) {
  const [deletedCategories, setDeletedCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToRestore, setCategoryToRestore] = useState<Category | null>(null);
  const { showSuccess, showError } = useAlert();

  const fetchDeletedCategories = async () => {
    setLoading(true);
    try {
      const response = await getDeletedCategories();
      if (response.code === 200 && Array.isArray(response.data)) {
        setDeletedCategories(response.data);
        setFilteredCategories(response.data);
      } else {
        showError('Failed to fetch deleted categories');
      }
    } catch (error) {
      console.error('Error fetching deleted categories:', error);
      showError('Error fetching deleted categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(deletedCategories);
    } else {
      const filtered = deletedCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.brandName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [deletedCategories, searchTerm]);

  const handleRestoreClick = (category: Category) => {
    setCategoryToRestore(category);
    setConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!categoryToRestore) return;

    setRestoring(categoryToRestore.id);
    setConfirmOpen(false);
    try {
      const response = await restoreCategory(categoryToRestore.id);
      if (response.code === 200) {
        // Remove from both deleted categories and filtered categories list
        setDeletedCategories(prev => prev.filter(item => item.id !== categoryToRestore.id));
        setFilteredCategories(prev => prev.filter(item => item.id !== categoryToRestore.id));
        showSuccess(`Category "${categoryToRestore.name}" has been restored successfully!`);
        onRestore?.();
      } else {
        showError(response.message || 'Failed to restore category');
      }
    } catch (error) {
      console.error('Error restoring category:', error);
      showError('Error restoring category');
    } finally {
      setRestoring(null);
      setCategoryToRestore(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeletedCategories();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

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
          className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-gray-200"
          style={{ zIndex: 99999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Deleted Categories</h3>
                <p className="text-sm text-gray-500">
                  Manage deleted categories and restore them if needed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Count */}
          <div className="mb-4 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search deleted categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
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

            {/* Count Display */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                {searchTerm ? (
                  <span>
                    Showing {filteredCategories.length} of {deletedCategories.length} deleted categories
                  </span>
                ) : (
                  <span>{deletedCategories.length} deleted categories total</span>
                )}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Loading deleted categories...</span>
              </div>
            ) : deletedCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deleted categories</h3>
                <p className="text-gray-500">There are no deleted categories to display.</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-500 mb-4">No deleted categories match your search for "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">Brand: {category.brandName}</p>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Deleted on {category.deleted_at ? new Date(category.deleted_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreClick(category)}
                      disabled={restoring === category.id}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                      {restoring === category.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="text-sm">Restoring...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-sm">Restore</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Restore Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setCategoryToRestore(null);
        }}
        onConfirm={handleConfirmRestore}
        title="Restore Category"
        description={`Are you sure you want to restore category "${categoryToRestore?.name}"? This will make it available again.`}
        confirmText="Restore"
        cancelText="Cancel"
        type="info"
        isLoading={restoring === categoryToRestore?.id}
      />
    </div>
  );
}