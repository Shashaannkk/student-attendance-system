import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const themes = [
        { value: 'light' as const, label: 'Light', icon: Sun },
        { value: 'dark' as const, label: 'Dark', icon: Moon },
        { value: 'auto' as const, label: 'Auto', icon: Monitor },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[0];
    const CurrentIcon = currentTheme.icon;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <CurrentIcon size={20} aria-hidden="true" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {themes.map((themeOption) => {
                        const Icon = themeOption.icon;
                        const isActive = theme === themeOption.value;

                        return (
                            <button
                                key={themeOption.value}
                                onClick={() => {
                                    setTheme(themeOption.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2 text-sm
                                    transition-colors
                                    ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }
                                `}
                                aria-label={`Switch to ${themeOption.label} theme`}
                            >
                                <Icon size={16} aria-hidden="true" />
                                <span className="font-medium">{themeOption.label}</span>
                                {isActive && (
                                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
