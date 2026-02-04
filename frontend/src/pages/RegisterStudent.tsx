import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ClipboardList, CreditCard, UserPlus, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const RegisterStudent = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        student_id: '',
        name: '',
        class_name: '',
        roll_no: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-red-900 mb-2">Access Denied</h3>
                    <p className="text-red-700">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Validate and Parse Roll No
            const rollNo = parseInt(formData.roll_no);
            if (isNaN(rollNo)) throw new Error("Roll Number must be a valid number");

            const response = await fetch(`${API_URL}/students/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    roll_no: rollNo
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            setMessage({ type: 'success', text: `Student ${formData.name} added successfully!` });
            setFormData({ student_id: '', name: '', class_name: '', roll_no: '' }); // Reset form
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Register New Student</h1>
                        <p className="text-gray-600 mt-1">Add a new student to the system</p>
                    </div>
                </div>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-2xl border-2 flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    {message.type === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                        <p className="font-medium">{message.text}</p>
                    </div>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Student Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="Enter student's full name"
                                />
                            </div>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Student ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="student_id"
                                    value={formData.student_id}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="STU001 (optional)"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">Leave empty to auto-generate</p>
                        </div>

                        {/* Roll Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Roll Number *
                            </label>
                            <input
                                type="number"
                                name="roll_no"
                                required
                                value={formData.roll_no}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                                placeholder="Enter roll number"
                            />
                        </div>

                        {/* Class Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Class Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ClipboardList className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="class_name"
                                    required
                                    value={formData.class_name}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="e.g., 10th Std, Class 5A"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t-2 border-gray-100">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Registering...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Register Student</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Helper Text */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Fields marked with * are required
                </p>
            </div>
        </div>
    );
};

export default RegisterStudent;
