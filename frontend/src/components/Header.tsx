import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Bell, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    const { user } = useAuth();
    const institutionType = user?.institution_type || 'school';

    return (
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-3 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-8 flex items-center justify-between transition-colors duration-200" role="banner">
            {/* Left: Branding */}
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-600 dark:bg-blue-500 p-1.5 sm:p-2 rounded-lg text-white" role="img" aria-label="Institution logo">
                    <BookOpen size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div>
                    <h1 className="text-gray-900 dark:text-gray-100 font-bold text-sm sm:text-lg capitalize">
                        {institutionType}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                        Attendance
                    </p>
                </div>
            </div>

            {/* Center: Search - Hidden on mobile */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                <div className="relative w-full" role="search">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search students, classes..."
                        aria-label="Search students and classes"
                        className="w-full bg-gray-50 dark:bg-gray-700 border-none rounded-2xl py-2.5 pl-10 pr-4 text-gray-600 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-gray-600 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notification Bell - Hidden on small mobile */}
                <button
                    className="hidden sm:block relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Notifications"
                    aria-describedby="notification-count"
                >
                    <Bell size={20} aria-hidden="true" />
                    <span
                        id="notification-count"
                        className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"
                        role="status"
                        aria-label="You have unread notifications"
                    ></span>
                </button>

                {/* Vertical Divider - Hidden on mobile */}
                <div className="hidden sm:block h-8 w-px bg-gray-100 dark:bg-gray-700" role="separator" aria-hidden="true"></div>

                {/* User Profile */}
                <button className="flex items-center gap-2 sm:gap-3 cursor-pointer group" aria-label="User menu" aria-haspopup="true">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm" aria-hidden="true">
                        {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none mb-1">
                            {user?.username || 'Admin User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize leading-none">
                            {user?.role || 'Administrator'}
                        </p>
                    </div>
                    <ChevronDown size={16} className="hidden sm:block text-gray-400 group-hover:text-gray-600 transition-colors" aria-hidden="true" />
                </button>
            </div>
        </header>
    );
};

export default Header;
