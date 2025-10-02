'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useAlert } from '@/components/AlertProvider';
import DashboardLayout from '@/components/DashboardLayout';
import CategoryModal from '@/components/CategoryModal';
import ConfirmModal from '@/components/ConfirmModal';
import DeletedCategoriesModal from '@/components/DeletedCategoriesModal';
import ViewDeletedButton from '@/components/ViewDeletedButton';
import { useDeletedItems } from '@/hooks/useDeletedItems';
import { 
  getCategoriesByBrandId,
  getCategory, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData 
} from '@/lib/categories';
import { getBrand, Brand } from '@/lib/brands';

export default function BrandViewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useAlert();
  const router = useRouter();
  const params = useParams();
  const brandId = Number(params.id);
  const [mounted, setMounted] = useState(false);

  // Brand state
  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandLoading, setBrandLoading] = useState(true);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Deleted items state
  const { showDeleted, openDeletedView, closeDeletedView } = useDeletedItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      console.log('🚫 Brand view page - No user, redirecting to login');
      router.push('/login');
    }
  }, [user, authLoading, router, mounted]);

  // Validate brandId
  useEffect(() => {
    if (mounted && isNaN(brandId)) {
      showError('Invalid brand ID');
      router.push('/dashboard/brands');
    }
  }, [mounted, brandId, router, showError]);

  const fetchBrand = useCallback(async () => {
    if (isNaN(brandId)) return;
    
    setBrandLoading(true);
    try {
      const response = await getBrand(brandId);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setBrand(response.data);
      } else {
        showError('Brand not found');
        router.push('/dashboard/brands');
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
      showError('Failed to fetch brand');
      router.push('/dashboard/brands');
    } finally {
      setBrandLoading(false);
    }
  }, [brandId, showError, router]);

  const fetchCategories = useCallback(async () => {
    if (isNaN(brandId)) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await getCategoriesByBrandId(brandId);
      
      if (response.code === 200 && Array.isArray(response.data)) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      } else {
        showError(response.message || 'Failed to fetch categories');
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, [brandId, showError]);

  useEffect(() => {
    if (mounted && user && !isNaN(brandId)) {
      fetchBrand();
      fetchCategories();
    }
  }, [mounted, user, brandId, fetchBrand, fetchCategories]);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);

  const handleView = async (category: Category) => {
    try {
      const response = await getCategory(category.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setSelectedCategory(response.data);
        setModalMode('view');
        setModalOpen(true);
      } else {
        showError('Failed to fetch category details');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      showError('Failed to fetch category details');
    }
  };

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = async (category: Category) => {
    try {
      const response = await getCategory(category.id);
      if (response.code === 200 && response.data && !Array.isArray(response.data)) {
        setSelectedCategory(response.data);
        setModalMode('edit');
        setModalOpen(true);
      } else {
        showError('Failed to fetch category details');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      showError('Failed to fetch category details');
    }
  };

  const handleSave = async (data: CreateCategoryData | UpdateCategoryData) => {
    setModalLoading(true);
    
    try {
      let response;
      
      if (modalMode === 'create') {
        // Set brandId to current brand for new categories
        const createData = { ...data as CreateCategoryData, brandId };
        response = await createCategory(createData);
      } else if (modalMode === 'edit' && selectedCategory) {
        response = await updateCategory(selectedCategory.id, data as UpdateCategoryData);
      }
      
      if (response && (response.code === 200 || response.code === 201)) {
        setModalOpen(false);
        await fetchCategories(); // Refresh the table
        showSuccess(`Category ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
      } else {
        showError(response?.message || `Failed to ${modalMode} category`);
      }
    } catch (error) {
      console.error(`Error ${modalMode} category:`, error);
      showError(`Failed to ${modalMode} category`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await deleteCategory(categoryToDelete.id);
      console.log('Delete category response:', categoryToDelete.id);
      if (response.code === 200) {
        setConfirmOpen(false);
        setCategoryToDelete(undefined);
        await fetchCategories(); // Refresh the table
        showSuccess('Category deleted successfully!');
      } else {
        showError(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showError('Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!mounted || authLoading || brandLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="mt-2 text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  if (!user || !brand) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/brands')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                title="Back to Brands"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                <p className="text-sm text-gray-500">
                  {brand.description || 'Brand categories and management'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate">
              Categories for {brand.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage categories for this brand and their information.
            </p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            
            {/* Search Results Info */}
            <div className="text-sm text-gray-500">
              {searchTerm ? (
                <span>
                  Showing {filteredCategories.length} of {categories.length} categories
                </span>
              ) : (
                <span>{categories.length} categories total</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <ViewDeletedButton
                onClick={openDeletedView}
                itemName="Categories"
              />
              <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Add New Category</span>
                <span className="sm:hidden">Add New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Categories</h3>
              <p className="text-gray-500">Please wait while we fetch the data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Categories</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchCategories}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                {searchTerm ? (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No Categories Found'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? (
                  <>No categories match your search for "{searchTerm}"</>
                ) : (
                  `Get started by creating your first category for ${brand.name}.`
                )}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add First Category
                </button>
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
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      <div className="flex items-center justify-end space-x-2">
                        <span>Actions</span>
                        <button
                          onClick={fetchCategories}
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
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(category)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                            title="View"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
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

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        category={selectedCategory}
        onSave={handleSave}
        isLoading={modalLoading}
        defaultBrandId={brandId} // Pass brandId as default
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setCategoryToDelete(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteLoading}
      />

      {/* Deleted Categories Modal */}
      <DeletedCategoriesModal
        isOpen={showDeleted}
        onClose={closeDeletedView}
        onRestore={() => {
          // Refresh categories list after restore
          fetchCategories();
        }}
      />
    </DashboardLayout>
  );
}