import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    // Only toggle between light and dark (remove auto mode)
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Toggle Circle */}
            <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-7' : 'translate-x-0'
                    }`}
            >
                {/* Icon inside the circle */}
                {isDark ? (
                    <Moon className="w-3 h-3 text-blue-500" />
                ) : (
                    <Sun className="w-3 h-3 text-yellow-500" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;
