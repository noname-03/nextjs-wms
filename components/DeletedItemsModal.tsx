'use client'

import { useState, useEffect } from 'react'

interface DeletedItem {
  id: string
  name: string
  deleted_at: string
  [key: string]: any
}

interface DeletedItemsModalProps {
  isOpen: boolean
  onClose: () => void
  endpoint: string // e.g., '/api/v1/categories'
  title: string // e.g., 'Deleted Categories'
  itemName: string // e.g., 'category'
  onRestore?: (id: string) => void
}

export default function DeletedItemsModal({
  isOpen,
  onClose,
  endpoint,
  title,
  itemName,
  onRestore
}: DeletedItemsModalProps) {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  const fetchDeletedItems = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${endpoint}/deleted`)
      if (response.ok) {
        const data = await response.json()
        setDeletedItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching deleted items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to restore ${itemName} "${name}"?`)) {
      return
    }

    setRestoring(id)
    try {
      const response = await fetch(`${endpoint}/${id}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Remove from deleted items
        setDeletedItems(prev => prev.filter(item => item.id !== id))
        onRestore?.(id)
        
        // Show success message
        alert(`${itemName} "${name}" has been restored successfully!`)
      } else {
        alert(`Failed to restore ${itemName}`)
      }
    } catch (error) {
      console.error('Error restoring item:', error)
      alert(`Error restoring ${itemName}`)
    } finally {
      setRestoring(null)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchDeletedItems()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage deleted items and restore them if needed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading deleted items...</span>
            </div>
          ) : deletedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No deleted items</h3>
              <p className="text-gray-500 dark:text-gray-400">There are no deleted {itemName}s to display.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transform transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Deleted on {new Date(item.deleted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(item.id, item.name)}
                    disabled={restoring === item.id}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {restoring === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Restoring...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Restore</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}