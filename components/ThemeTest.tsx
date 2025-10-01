'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 border-2 border-red-500">
      <h3 className="text-lg font-bold mb-2">Theme Test Component</h3>
      <p>Current theme: <strong>{theme}</strong></p>
      
      {/* Test background colors */}
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
        <p className="text-gray-900 dark:text-white">This should change color based on theme</p>
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
          <span className="text-gray-700 dark:text-gray-300">Nested element test</span>
        </div>
      </div>
      
      <button
        onClick={() => {
          console.log('Manual toggle clicked, current theme:', theme);
          toggleTheme();
        }}
        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded"
      >
        Toggle Theme (Current: {theme})
      </button>
      
      {/* Direct class test */}
      <div className="mt-4 space-y-2">
        <div className="p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          Red background test
        </div>
        <div className="p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          Green background test
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
          Blue background test
        </div>
      </div>
    </div>
  );
}