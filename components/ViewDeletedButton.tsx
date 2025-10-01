'use client'

interface ViewDeletedButtonProps {
  onClick: () => void
  itemName: string // e.g., 'Categories', 'Brands', 'Products'
  count?: number
}

export default function ViewDeletedButton({ onClick, itemName, count }: ViewDeletedButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-all duration-200 border border-red-600 dark:border-red-700 hover:scale-105 active:scale-95 text-sm font-medium"
    >
      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="hidden sm:inline">View Deleted {itemName}</span>
      <span className="sm:hidden">View Deleted</span>
      {count !== undefined && count > 0 && (
        <span className="bg-red-800 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  )
}