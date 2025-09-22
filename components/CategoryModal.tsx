'use client';

import { useState, useEffect, useCallback } from 'react';
import { Category, CreateCategoryData, UpdateCategoryData } from '@/lib/categories';
import { Brand, getBrands } from '@/lib/brands';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'view' | 'create' | 'edit';
  category?: Category;
  onSave: (data: CreateCategoryData | UpdateCategoryData) => Promise<void>;
  isLoading?: boolean;
}

export default function CategoryModal({ isOpen, onClose, mode, category, onSave, isLoading = false }: CategoryModalProps) {
  const [formData, setFormData] = useState<CreateCategoryData>({
    brandId: 0,
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ brandId?: string; name?: string; description?: string }>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const response = await getBrands();
      if (response.code === 200 && Array.isArray(response.data)) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
      
      if (mode === 'edit' && category) {
        setFormData({
          brandId: category.brandId,
          name: category.name,
          description: category.description || '',
        });
      } else if (mode === 'create') {
        setFormData({
          brandId: 0,
          name: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, category, fetchBrands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { brandId?: string; name?: string; description?: string } = {};
    
    if (!formData.brandId || formData.brandId === 0) {
      newErrors.brandId = 'Brand is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'brandId' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!isOpen) {
    return null;
  }

  const getTitle = () => {
    switch (mode) {
      case 'view': return 'View Category';
      case 'create': return 'Create New Category';
      case 'edit': return 'Edit Category';
      default: return 'Category';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 99999 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - transparent */}
        <div
          className="fixed inset-0"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div 
          className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl border border-gray-200"
          style={{ zIndex: 99999 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {mode === 'view' && category ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {category.brand?.name || 'Unknown Brand'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{category.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[80px]">
                  {category.description || 'No description provided'}
                </p>
              </div>
              {category.created_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(category.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Brand field */}
              <div>
                <label htmlFor="category-brandId" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select
                  id="category-brandId"
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.brandId 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  disabled={isLoading || loadingBrands}
                  required
                >
                  <option value={0}>Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brandId && (
                  <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>
                )}
                {loadingBrands && (
                  <p className="mt-1 text-sm text-gray-500">Loading brands...</p>
                )}
              </div>

              {/* Name field */}
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="category-name"
                  name="name"
                  autoComplete="off"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter category name"
                  disabled={isLoading}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="category-description"
                  name="description"
                  autoComplete="off"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white ${
                    errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-indigo-500'
                  }`}
                  placeholder="Enter category description (optional)"
                  disabled={isLoading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
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
                  disabled={isLoading || loadingBrands}
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
                    mode === 'create' ? 'Create Category' : 'Update Category'
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