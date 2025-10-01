'use client'

import { useState } from 'react'

export function useDeletedItems() {
  const [showDeleted, setShowDeleted] = useState(false)

  const openDeletedView = () => setShowDeleted(true)
  const closeDeletedView = () => setShowDeleted(false)

  return {
    showDeleted,
    openDeletedView,
    closeDeletedView
  }
}