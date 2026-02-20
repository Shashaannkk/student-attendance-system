import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, BarChart3, Settings, LogOut, BookOpen, GraduationCap, Shield, UserPlus } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Determine institution type and theme
    const institutionType = user?.institution_type || 'school';
    const isSchool = institutionType === 'school';

    const theme = {
        gradient: isSchool ? 'from-blue-500 to-cyan-500' : 'from-indigo-600 to-purple-600',
        hoverBg: isSchool ? 'hover:bg-blue-50' : 'hover:bg-purple-50',
        activeGradient: isSchool ? 'from-blue-500 to-cyan-500' : 'from-indigo-600 to-purple-600',
        activeShadow: isSchool ? 'shadow-blue-200' : 'shadow-purple-200',
        iconHover: isSchool ? 'group-hover:text-blue-500' : 'group-hover:text-purple-500',
        title: isSchool ? 'School' : 'College',
        Icon: isSchool ? BookOpen : GraduationCap
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Students', icon: Users, path: '/register-student' },
        { name: 'Attendance', icon: Calendar, path: '/take-attendance' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        // Hidden on mobile (< 768px), visible on desktop
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 shadow-lg dark:shadow-gray-900/50 flex flex-col z-50 transition-colors duration-200" role="navigation" aria-label="Main navigation">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center shadow-lg`} role="img" aria-label={`${theme.title} logo`}>
                        <theme.Icon className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{theme.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2" aria-label="Primary navigation">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            aria-label={`Navigate to ${item.name}`}
                            aria-current={active ? 'page' : undefined}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200 ease-in-out
                                group relative
                                ${active
                                    ? `bg-gradient-to-r ${theme.activeGradient} text-white shadow-lg ${theme.activeShadow} scale-105`
                                    : `text-gray-700 dark:text-gray-300 ${theme.hoverBg} dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:scale-105 hover:shadow-md`
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : `text-gray-600 ${theme.iconHover}`} transition-colors`} aria-hidden="true" />
                            <span className="font-medium">{item.name}</span>

                            {/* Hover effect indicator */}
                            {!active && (
                                <div className={`absolute left-0 w-1 h-0 bg-gradient-to-b ${theme.activeGradient} rounded-r-full group-hover:h-full transition-all duration-200`} aria-hidden="true" />
                            )}
                        </Link>
                    );
                })}

                {/* Admin-only: Register User (Teacher Invites) */}
                {user?.role === 'admin' && (
                    <Link
                        to="/register-user"
                        aria-label="Navigate to Register User"
                        aria-current={isActive('/register-user') ? 'page' : undefined}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            transition-all duration-200 ease-in-out
                            group relative
                            ${isActive('/register-user')
                                ? `bg-gradient-to-r ${theme.activeGradient} text-white shadow-lg ${theme.activeShadow} scale-105`
                                : `text-gray-700 dark:text-gray-300 ${theme.hoverBg} dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white hover:scale-105 hover:shadow-md`
                            }
                        `}
                    >
                        <UserPlus className={`w-5 h-5 ${isActive('/register-user') ? 'text-white' : `text-gray-600 ${theme.iconHover}`} transition-colors`} aria-hidden="true" />
                        <span className="font-medium">Register User</span>

                        {/* Hover effect indicator */}
                        {!isActive('/register-user') && (
                            <div className={`absolute left-0 w-1 h-0 bg-gradient-to-b ${theme.activeGradient} rounded-r-full group-hover:h-full transition-all duration-200`} aria-hidden="true" />
                        )}
                    </Link>
                )}

                {/* Admin-only link */}
                {user?.role === 'admin' && (
                    <>
                        <div className="my-4 border-t border-gray-200 dark:border-gray-700" role="separator" aria-hidden="true" />
                        <Link
                            to="/admin"
                            aria-label="Navigate to Admin Panel"
                            aria-current={isActive('/admin') ? 'page' : undefined}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200 ease-in-out
                                group relative
                                ${isActive('/admin')
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-200 scale-105'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-gray-900 dark:hover:text-white hover:scale-105 hover:shadow-md'
                                }
                            `}
                        >
                            <Shield className={`w-5 h-5 ${isActive('/admin') ? 'text-white' : 'text-gray-600 group-hover:text-red-500'} transition-colors`} aria-hidden="true" />
                            <span className="font-medium">Admin Panel</span>

                            {/* Hover effect indicator */}
                            {!isActive('/admin') && (
                                <div className="absolute left-0 w-1 h-0 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full group-hover:h-full transition-all duration-200" aria-hidden="true" />
                            )}
                        </Link>
                    </>
                )}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    aria-label="Logout from your account"
                    className="
                        flex items-center gap-3 px-4 py-3 rounded-xl w-full
                        text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400
                        transition-all duration-200 ease-in-out
                        hover:scale-105 hover:shadow-md
                        group
                    "
                >
                    <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" aria-hidden="true" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
