import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, GraduationCap, BookOpen, Building2, Sparkles, Mail, Phone, MapPin, Hash, CheckCircle } from 'lucide-react';

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [institutionType, setInstitutionType] = useState<'school' | 'college'>(
        (searchParams.get('type') as 'school' | 'college') || 'school'
    );

    // Form state
    const [formData, setFormData] = useState({
        institutionName: '',
        institutionCode: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contactNumber: '',
        email: '',
        adminUsername: '',
        adminPassword: '',
        confirmPassword: '',
        // School specific
        board: '',
        classesOffered: '',
        // College specific
        universityAffiliation: '',
        coursesOffered: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Update institution type from URL parameter
    useEffect(() => {
        const type = searchParams.get('type') as 'school' | 'college';
        if (type === 'school' || type === 'college') {
            setInstitutionType(type);
        }
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
        if (!formData.institutionCode.trim()) newErrors.institutionCode = 'Institution code is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
        if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (!/^\d{10}$/.test(formData.contactNumber)) newErrors.contactNumber = 'Invalid contact number';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
        if (!formData.adminUsername.trim()) newErrors.adminUsername = 'Admin username is required';
        if (!formData.adminPassword) newErrors.adminPassword = 'Password is required';
        if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Password must be at least 6 characters';
        if (formData.adminPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        if (institutionType === 'school') {
            if (!formData.board) newErrors.board = 'Board is required';
            if (!formData.classesOffered.trim()) newErrors.classesOffered = 'Classes offered is required';
        } else {
            if (!formData.universityAffiliation.trim()) newErrors.universityAffiliation = 'University affiliation is required';
            if (!formData.coursesOffered.trim()) newErrors.coursesOffered = 'Courses offered is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setErrors({ submit: err.message || 'Registration failed' });
        } finally {
            setIsLoading(false);
        }
    };

    // Theme configuration (same as Login)
    const themes = {
        school: {
            gradient: 'from-blue-500 via-cyan-500 to-teal-400',
            cardGradient: 'from-blue-600 to-cyan-600',
            buttonPrimary: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
            icon: BookOpen,
            title: 'School Registration',
            subtitle: 'Register your school for smart attendance management'
        },
        college: {
            gradient: 'from-indigo-600 via-purple-600 to-pink-500',
            cardGradient: 'from-indigo-700 to-purple-700',
            buttonPrimary: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
            icon: GraduationCap,
            title: 'College Registration',
            subtitle: 'Register your college for professional attendance tracking'
        }
    };

    const currentTheme = themes[institutionType];
    const IconComponent = currentTheme.icon;

    if (isSuccess) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-4`}>
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
                    <div className={`mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6`}>
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your {institutionType} has been registered successfully. Redirecting to login...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                        <span className="text-sm text-gray-500">Redirecting...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-4`}>
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-start py-8">

                {/* Left Panel - Hero Section */}
                <div className="hidden lg:flex flex-col items-center justify-center text-white space-y-4 p-8 sticky top-8">
                    {/* Institution Type Toggle */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2 mb-4">
                        <button
                            onClick={() => setInstitutionType('school')}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${institutionType === 'school'
                                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            School
                        </button>
                        <button
                            onClick={() => setInstitutionType('college')}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${institutionType === 'college'
                                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <GraduationCap className="w-5 h-5" />
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

                    {/* Back to Login */}
                    <div className="mt-6 w-full max-w-sm">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                            <p className="text-white/90 mb-3 text-sm">
                                Already have an account?
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-2 px-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white shadow-lg hover:bg-white/30 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Registration Form */}
                <div className="w-full">
                    {/* Mobile Institution Toggle */}
                    <div className="lg:hidden bg-white/10 backdrop-blur-md rounded-2xl p-2 flex gap-2 mb-6">
                        <button
                            onClick={() => setInstitutionType('school')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${institutionType === 'school'
                                    ? 'bg-white text-blue-600 shadow-lg'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            School
                        </button>
                        <button
                            onClick={() => setInstitutionType('college')}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${institutionType === 'college'
                                    ? 'bg-white text-purple-600 shadow-lg'
                                    : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            College
                        </button>
                    </div>

                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
                        <div className="text-center mb-6">
                            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentTheme.cardGradient} rounded-2xl mb-4 shadow-lg`}>
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                Create Account
                            </h2>
                            <p className="text-gray-600">
                                Fill in the details to register your {institutionType}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Institution Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Institution Details</h3>

                                {/* Institution Name */}
                                <div>
                                    <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Institution Name *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building2 className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="institutionName"
                                            name="institutionName"
                                            type="text"
                                            value={formData.institutionName}
                                            onChange={handleInputChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="Enter institution name"
                                        />
                                    </div>
                                    {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
                                </div>

                                {/* Institution Code */}
                                <div>
                                    <label htmlFor="institutionCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        Institution Code *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Hash className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="institutionCode"
                                            name="institutionCode"
                                            type="text"
                                            value={formData.institutionCode}
                                            onChange={handleInputChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="Unique institution code"
                                        />
                                    </div>
                                    {errors.institutionCode && <p className="text-red-500 text-xs mt-1">{errors.institutionCode}</p>}
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="Street address"
                                        />
                                    </div>
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                </div>

                                {/* City, State, Pincode */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            id="city"
                                            name="city"
                                            type="text"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="City"
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="State"
                                        />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                                            Pincode *
                                        </label>
                                        <input
                                            id="pincode"
                                            name="pincode"
                                            type="text"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="Pincode"
                                        />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                    </div>
                                </div>

                                {/* Contact Number and Email */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Number *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="contactNumber"
                                                name="contactNumber"
                                                type="tel"
                                                value={formData.contactNumber}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="10-digit number"
                                            />
                                        </div>
                                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* School/College Specific Fields */}
                                {institutionType === 'school' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="board" className="block text-sm font-medium text-gray-700 mb-1">
                                                Board *
                                            </label>
                                            <select
                                                id="board"
                                                name="board"
                                                value={formData.board}
                                                onChange={handleInputChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            >
                                                <option value="">Select Board</option>
                                                <option value="CBSE">CBSE</option>
                                                <option value="ICSE">ICSE</option>
                                                <option value="State Board">State Board</option>
                                                <option value="IB">IB</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="classesOffered" className="block text-sm font-medium text-gray-700 mb-1">
                                                Classes Offered *
                                            </label>
                                            <input
                                                id="classesOffered"
                                                name="classesOffered"
                                                type="text"
                                                value={formData.classesOffered}
                                                onChange={handleInputChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="e.g., 1-12"
                                            />
                                            {errors.classesOffered && <p className="text-red-500 text-xs mt-1">{errors.classesOffered}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="universityAffiliation" className="block text-sm font-medium text-gray-700 mb-1">
                                                University Affiliation *
                                            </label>
                                            <input
                                                id="universityAffiliation"
                                                name="universityAffiliation"
                                                type="text"
                                                value={formData.universityAffiliation}
                                                onChange={handleInputChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="University name"
                                            />
                                            {errors.universityAffiliation && <p className="text-red-500 text-xs mt-1">{errors.universityAffiliation}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="coursesOffered" className="block text-sm font-medium text-gray-700 mb-1">
                                                Courses Offered *
                                            </label>
                                            <input
                                                id="coursesOffered"
                                                name="coursesOffered"
                                                type="text"
                                                value={formData.coursesOffered}
                                                onChange={handleInputChange}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="e.g., B.Tech, MBA, BBA"
                                            />
                                            {errors.coursesOffered && <p className="text-red-500 text-xs mt-1">{errors.coursesOffered}</p>}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Admin Credentials Section */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Admin Credentials</h3>

                                <div>
                                    <label htmlFor="adminUsername" className="block text-sm font-medium text-gray-700 mb-1">
                                        Admin Username *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="adminUsername"
                                            name="adminUsername"
                                            type="text"
                                            value={formData.adminUsername}
                                            onChange={handleInputChange}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                    {errors.adminUsername && <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="adminPassword"
                                                name="adminPassword"
                                                type="password"
                                                value={formData.adminPassword}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="Min 6 characters"
                                            />
                                        </div>
                                        {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                                placeholder="Re-enter password"
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-6 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                                {isLoading ? 'Registering...' : 'Register Institution'}
                            </button>

                            {/* Mobile Back to Login */}
                            <div className="lg:hidden text-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Already have an account? <span className="font-semibold">Login</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
