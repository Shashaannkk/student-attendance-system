import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Upload } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white shadow-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                AttendEase
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Dashboard
                            </Link>

                            {user.role === 'admin' && (
                                <div className="relative inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                    onBlur={() => setTimeout(() => setAdminMenuOpen(false), 200)}
                                >
                                    <span className="mr-1">Admin Actions</span>
                                    <ChevronDown className="w-4 h-4" />

                                    {adminMenuOpen && (
                                        <div className="absolute top-16 left-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                            <div className="py-1" role="menu">
                                                <Link to="/register-user" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Register Staff</Link>
                                                <Link to="/register-student" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Register Student</Link>
                                                <Link to="/upload-students" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                    <span className="flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload Bulk Data</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-700">
                                <User className="w-5 h-5" />
                                <span className="capitalize font-medium">{user.username} ({user.role})</span>
                            </div>
                            <button onClick={handleLogout} className="p-1 rounded-full text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-200">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/dashboard" className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Dashboard
                        </Link>
                        {user.role === 'admin' && (
                            <>
                                <Link to="/register-user" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                                    Register Staff
                                </Link>
                                <Link to="/register-student" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                                    Register Student
                                </Link>
                                <Link to="/upload-students" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                                    Upload Bulk Data
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <User className="h-10 w-10 rounded-full bg-gray-100 p-2 text-gray-500" />
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800 capitalize">{user.username}</div>
                                <div className="text-sm font-medium text-gray-500">{user.role}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-auto flex-shrink-0 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <span className="sr-only">Log out</span>
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
