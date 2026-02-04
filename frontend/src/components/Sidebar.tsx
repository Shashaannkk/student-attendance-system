import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Calendar, BarChart3, Settings, LogOut, BookOpen, GraduationCap } from 'lucide-react';

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
        { name: 'Attendance', icon: Calendar, path: '/attendance' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-lg flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <theme.Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{theme.title}</h1>
                        <p className="text-sm text-gray-500">Attendance</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-200 ease-in-out
                                group relative
                                ${active
                                    ? `bg-gradient-to-r ${theme.activeGradient} text-white shadow-lg ${theme.activeShadow} scale-105`
                                    : `text-gray-600 ${theme.hoverBg} hover:text-gray-900 hover:scale-105 hover:shadow-md`
                                }
                            `}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : `text-gray-500 ${theme.iconHover}`} transition-colors`} />
                            <span className="font-medium">{item.name}</span>

                            {/* Hover effect indicator */}
                            {!active && (
                                <div className={`absolute left-0 w-1 h-0 bg-gradient-to-b ${theme.activeGradient} rounded-r-full group-hover:h-full transition-all duration-200`} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="
                        flex items-center gap-3 px-4 py-3 rounded-xl w-full
                        text-gray-600 hover:bg-red-50 hover:text-red-600
                        transition-all duration-200 ease-in-out
                        hover:scale-105 hover:shadow-md
                        group
                    "
                >
                    <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
