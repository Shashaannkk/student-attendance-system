import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, Bell, ChevronDown } from 'lucide-react';

const Header = () => {
    const { user } = useAuth();
    const institutionType = user?.institution_type || 'school';

    return (
        <header className="bg-white rounded-xl shadow-sm px-6 py-4 mb-8 flex items-center justify-between">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                    <BookOpen size={24} />
                </div>
                <div>
                    <h1 className="text-gray-900 font-bold text-lg capitalize">
                        {institutionType}
                    </h1>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                        Attendance
                    </p>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students, classes..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-10 pr-4 text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-100"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {user?.username?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                            {user?.username || 'Admin User'}
                        </p>
                        <p className="text-xs text-gray-500 capitalize leading-none">
                            {user?.role || 'Administrator'}
                        </p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
            </div>
        </header>
    );
};

export default Header;
