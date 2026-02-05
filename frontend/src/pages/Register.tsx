import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, GraduationCap, BookOpen, Building2, Mail, CheckCircle, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config';

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [institutionType, setInstitutionType] = useState<'school' | 'college'>(
        (searchParams.get('type') as 'school' | 'college') || 'school'
    );
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

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
        board: '',
        classesOffered: '',
        universityAffiliation: '',
        coursesOffered: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const type = searchParams.get('type') as 'school' | 'college';
        if (type === 'school' || type === 'college') {
            setInstitutionType(type);
        }
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.institutionName.trim()) newErrors.institutionName = 'Required';
            if (!formData.institutionCode.trim()) newErrors.institutionCode = 'Required';
            if (!formData.address.trim()) newErrors.address = 'Required';
            if (!formData.city.trim()) newErrors.city = 'Required';
            if (!formData.state.trim()) newErrors.state = 'Required';
            if (!formData.pincode.trim()) newErrors.pincode = 'Required';
            else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';
        } else if (step === 2) {
            if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Required';
            else if (!/^\d{10}$/.test(formData.contactNumber)) newErrors.contactNumber = 'Invalid number';
            if (!formData.email.trim()) newErrors.email = 'Required';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';

            if (institutionType === 'school') {
                if (!formData.board) newErrors.board = 'Required';
                if (!formData.classesOffered.trim()) newErrors.classesOffered = 'Required';
            } else {
                if (!formData.universityAffiliation.trim()) newErrors.universityAffiliation = 'Required';
                if (!formData.coursesOffered.trim()) newErrors.coursesOffered = 'Required';
            }
        } else if (step === 3) {
            if (!formData.adminUsername.trim()) newErrors.adminUsername = 'Required';
            if (!formData.adminPassword) newErrors.adminPassword = 'Required';
            else if (formData.adminPassword.length < 6) newErrors.adminPassword = 'Min 6 characters';
            if (formData.adminPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const [orgCodeResponse, setOrgCodeResponse] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/register-organization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    institution_name: formData.institutionName,
                    institution_type: institutionType,
                    email: formData.email,
                    admin_username: formData.adminUsername,
                    admin_password: formData.adminPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await response.json();
            setOrgCodeResponse(data.org_code);
            setIsSuccess(true);
            // Don't auto-redirect, let user see the org code
        } catch (err: any) {
            setErrors({ submit: err.message || 'Registration failed' });
        } finally {
            setIsLoading(false);
        }
    };

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

    const steps = [
        { number: 1, title: 'Institution Details', icon: Building2 },
        { number: 2, title: 'Contact & Info', icon: Mail },
        { number: 3, title: 'Admin Account', icon: User }
    ];

    if (isSuccess) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-4`}>
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center animate-fade-in">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
                    <p className="text-gray-600 mb-8">
                        Your {institutionType} has been registered successfully.
                    </p>

                    {/* Organization Code Display */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Your Organization Code</p>
                        <div className="bg-white rounded-xl p-4 mb-3">
                            <p className="text-3xl font-bold text-blue-600 tracking-wider font-mono">{orgCodeResponse}</p>
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(orgCodeResponse);
                                alert('Organization code copied to clipboard!');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            📋 Click to copy
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6 text-left">
                        <p className="font-semibold text-yellow-900 mb-3">⚠️ Important - Save This Information:</p>
                        <ul className="text-sm text-yellow-800 space-y-2">
                            <li>✓ An email has been sent to <strong>{formData.email}</strong></li>
                            <li>✓ Keep your organization code secure</li>
                            <li>✓ You'll need it every time you login</li>
                            <li>✓ Share it only with authorized staff</li>
                        </ul>
                    </div>

                    {/* Login Instructions */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-6 text-left">
                        <p className="font-semibold text-gray-900 mb-3">How to Login:</p>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                            <li>Go to the login page</li>
                            <li>Enter Organization Code: <span className="font-mono font-bold">{orgCodeResponse}</span></li>
                            <li>Enter Username: <span className="font-bold">{formData.adminUsername}</span></li>
                            <li>Enter your password</li>
                        </ol>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className={`w-full py-4 px-6 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200`}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} flex items-center justify-center p-2 sm:p-4 lg:p-6 py-4 sm:py-8`}>
            <div className="w-full max-w-4xl px-2 sm:px-0">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${currentTheme.cardGradient} rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg`}>
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">{currentTheme.title}</h1>
                    <p className="text-white/90 text-sm sm:text-base lg:text-lg">{currentTheme.subtitle}</p>
                </div>

                {/* Institution Type Toggle */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 lg:mb-8 max-w-md mx-auto">
                    <button
                        onClick={() => setInstitutionType('school')}
                        className={`flex-1 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base ${institutionType === 'school'
                            ? 'bg-white text-blue-600 shadow-lg scale-105'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        School
                    </button>
                    <button
                        onClick={() => setInstitutionType('college')}
                        className={`flex-1 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base ${institutionType === 'college'
                            ? 'bg-white text-purple-600 shadow-lg scale-105'
                            : 'text-white hover:bg-white/10'
                            }`}
                    >
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        College
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep > step.number
                                            ? `bg-gradient-to-br ${currentTheme.cardGradient} text-white shadow-lg`
                                            : currentStep === step.number
                                                ? 'bg-white text-gray-800 shadow-lg scale-110'
                                                : 'bg-white/20 text-white/60'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                                        ) : (
                                            <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                        )}
                                    </div>
                                    <span className={`text-xs mt-1 sm:mt-2 font-medium ${currentStep >= step.number ? 'text-white' : 'text-white/60'} hidden sm:block`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-0.5 w-8 sm:w-16 transition-all duration-300 ${currentStep > step.number ? `bg-gradient-to-r ${currentTheme.buttonPrimary}` : 'bg-white/20'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Step 1: Institution Details */}
                        {currentStep === 1 && (
                            <div className="space-y-4 sm:space-y-5 animate-fade-in">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Institution Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Institution Name *</label>
                                        <input
                                            name="institutionName"
                                            type="text"
                                            value={formData.institutionName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 text-sm sm:text-base"
                                            placeholder="Enter institution name"
                                        />
                                        {errors.institutionName && <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Institution Code *</label>
                                        <input
                                            name="institutionCode"
                                            type="text"
                                            value={formData.institutionCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="Unique code"
                                        />
                                        {errors.institutionCode && <p className="text-red-500 text-xs mt-1">{errors.institutionCode}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                                        <input
                                            name="city"
                                            type="text"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="City"
                                        />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="Street address"
                                        />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                                        <input
                                            name="state"
                                            type="text"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="State"
                                        />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                                        <input
                                            name="pincode"
                                            type="text"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="6-digit pincode"
                                        />
                                        {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Contact & Info */}
                        {currentStep === 2 && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Contact & Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number *</label>
                                        <input
                                            name="contactNumber"
                                            type="tel"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="10-digit number"
                                        />
                                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                                        <input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    {institutionType === 'school' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Board *</label>
                                                <select
                                                    name="board"
                                                    value={formData.board}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
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
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Classes Offered *</label>
                                                <input
                                                    name="classesOffered"
                                                    type="text"
                                                    value={formData.classesOffered}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                                    placeholder="e.g., 1-12"
                                                />
                                                {errors.classesOffered && <p className="text-red-500 text-xs mt-1">{errors.classesOffered}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">University Affiliation *</label>
                                                <input
                                                    name="universityAffiliation"
                                                    type="text"
                                                    value={formData.universityAffiliation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                                    placeholder="University name"
                                                />
                                                {errors.universityAffiliation && <p className="text-red-500 text-xs mt-1">{errors.universityAffiliation}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Courses Offered *</label>
                                                <input
                                                    name="coursesOffered"
                                                    type="text"
                                                    value={formData.coursesOffered}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                                    placeholder="e.g., B.Tech, MBA"
                                                />
                                                {errors.coursesOffered && <p className="text-red-500 text-xs mt-1">{errors.coursesOffered}</p>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Admin Account */}
                        {currentStep === 3 && (
                            <div className="space-y-5 animate-fade-in">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">Admin Account</h3>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Username *</label>
                                        <input
                                            name="adminUsername"
                                            type="text"
                                            value={formData.adminUsername}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                            placeholder="Choose a username"
                                        />
                                        {errors.adminUsername && <p className="text-red-500 text-xs mt-1">{errors.adminUsername}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                                            <div className="relative">
                                                <input
                                                    name="adminPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.adminPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                                    placeholder="Min 6 characters"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                                            <div className="relative">
                                                <input
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                                                    placeholder="Re-enter password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {errors.submit && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {errors.submit}
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? () => navigate('/') : handleBack}
                                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                {currentStep === 1 ? 'Back to Login' : 'Previous'}
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={`px-8 py-3 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
                                >
                                    Next
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-8 py-3 bg-gradient-to-r ${currentTheme.buttonPrimary} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2`}
                                >
                                    {isLoading ? 'Registering...' : 'Complete Registration'}
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/90 hover:text-white text-sm font-medium transition-colors"
                    >
                        Already have an account? <span className="underline">Login</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
