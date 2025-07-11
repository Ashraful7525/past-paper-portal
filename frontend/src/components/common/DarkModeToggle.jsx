import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Light
      </span>
      <button
        onClick={toggleDarkMode}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
        `}
        aria-label="Toggle dark mode"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Dark
      </span>
    </div>
  );
};

export default DarkModeToggle;