import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, GraduationCap, BookOpen, Building2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
    const [institutionType, setInstitutionType] = useState<'school' | 'college'>('school');
    const [orgCode, setOrgCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'admin' | 'teacher'>('teacher');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new URLSearchParams();
            formData.append('org_code', orgCode.toUpperCase());
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid credentials');
            }

            const data = await response.json();

            const userResponse = await fetch(`${API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userData = await userResponse.json();

            // Validate that selected role matches user's actual role
            if (role !== userData.role) {
                if (role === 'admin') {
                    throw new Error('You are not authorized as an Admin');
                } else {
                    throw new Error('You are not authorized as a Teacher. Please select the correct role.');
                }
            }

            // Include the selected institution type in the user object
            login(data.access_token, {
                username: userData.username,
                role: userData.role,
                institution_type: userData.institution_type || institutionType
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate(`/register?type=${institutionType}`);
    };

    // Theme configuration
    const themes = {
        school: {
            gradient: 'from-blue-500 via-cyan-500 to-teal-400',
            cardGradient: 'from-blue-600 to-cyan-600',
            buttonPrimary: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
            buttonSecondary: 'bg-cyan-500 hover:bg-cyan-600',
            accentColor: 'text-cyan-400',
            icon: BookOpen,
            title: 'School Attendance',
            subtitle: 'Making attendance fun and easy for schools',
            registerText: 'Register Your School'
        },
        college: {
            gradient: 'from-indigo-600 via-purple-600 to-pink-500',
            cardGradient: 'from-indigo-700 to-purple-700',
            buttonPrimary: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
            buttonSecondary: 'bg-purple-500 hover:bg-purple-600',
            accentColor: 'text-purple-400',
            icon: GraduationCap,
            title: 'College Attendance',
            subtitle: 'Professional attendance management for degree colleges',
            registerText: 'Register Your College'
        }
    };

    const currentTheme = themes[institutionType];
    const IconComponent = currentTheme.icon;

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-2 sm:p-4`}>
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-4 sm:gap-8 items-center">

                {/* Left Panel - Hero Section */}
                <div className="hidden lg:flex flex-col items-center justify-center text-white space-y-4 p-8">
                    {/* Institution Type Toggle */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2 mb-4">
                        <button
                            onClick={() => setInstitutionType('school')}
                            className={`px-6 lg:px-8 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm lg:text-base ${institutionType === 'school'
                                ? 'bg-white text-blue-600 shadow-lg scale-105'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />
                            School
                        </button>
                        <button
                            onClick={() => setInstitutionType('college')}
                            className={`px-6 lg:px-8 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm lg:text-base ${institutionType === 'college'
                                ? 'bg-white text-purple-600 shadow-lg scale-105'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4 lg:w-5 lg:h-5" />
                            College
                        </button>
                    </div>

                    {/* Hero Content */}
                    <div className="text-center space-y-4">
                        <div className={`mx-auto w-24 h-24 bg-gradient-to-br ${currentTheme.cardGradient} rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-12 h-12 text-white" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold drop-shadow-lg whitespace-nowrap">
                                {currentTheme.title}
                            </h1>
                            <div className="h-16 flex items-center justify-center">
                                <p className="text-base text-white/90 max-w-sm text-center leading-snug">
                                    {currentTheme.subtitle}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-white/80">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm">Smart • Efficient • Reliable</span>
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Registration CTA */}
                    <div className="mt-6 space-y-4 w-full max-w-sm">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                            <Building2 className="w-6 h-6 mx-auto mb-2 text-white/90" />
                            <p className="text-white/90 mb-3 text-sm">
                                Don't have an account yet?
                            </p>
                            <button
                                onClick={handleRegister}
                                className={`w-full py-2 px-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white shadow-lg hover:bg-white/30 hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                            >
                                {currentTheme.registerText}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full px-2 sm:px-0">
                    {/* Mobile Institution Toggle */}
                    <div className="lg:hidden bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                        <button
                            onClick={() => setInstitutionType('school')}
                            className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${institutionType === 'school'
                                ? 'bg-white text-blue-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                            School
                        </button>
                        <button
                            onClick={() => setInstitutionType('college')}
                            className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${institutionType === 'college'
                                ? 'bg-white text-purple-600 shadow-lg'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                            College
                        </button>
                    </div>

                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10">
                        <div className="text-center mb-6 sm:mb-8">
                            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${currentTheme.cardGradient} rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg`}>
                                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Sign in to manage attendance
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${role === 'admin'
                                    ? `bg-gradient-to-r ${currentTheme.buttonPrimary} text-white shadow-lg scale-105`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('teacher')}
                                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${role === 'teacher'
                                    ? `bg-gradient-to-r ${currentTheme.buttonPrimary} text-white shadow-lg scale-105`
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Teacher
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            {/* Organization Code Field */}
                            <div>
                                <label htmlFor="orgCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Organization Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                        <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="orgCode"
                                        name="orgCode"
                                        type="text"
                                        required
                                        className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 uppercase text-sm sm:text-base"
                                        placeholder="SCH-DEMO-TEST01"
                                        value={orgCode}
                                        onChange={(e) => setOrgCode(e.target.value)}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter your institution's organization code</p>
                            </div>

                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                        ) : (
                                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Loading Message */}
                            {isLoading && (
                                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="hidden sm:inline">Signing in... (Server may take 30-60s to wake up)</span>
                                        <span className="sm:hidden">Signing in...</span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base`}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        {/* Mobile Registration CTA */}
                        <div className="lg:hidden mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200">
                            <p className="text-center text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                                Don't have an account?
                            </p>
                            <button
                                onClick={handleRegister}
                                className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base`}
                            >
                                {currentTheme.registerText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
