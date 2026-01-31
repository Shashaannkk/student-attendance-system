import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ClipboardList, CreditCard } from 'lucide-react';

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
        return <div className="p-8 text-center text-red-600">Access Denied: Admins only.</div>;
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

            const response = await fetch('http://localhost:8000/students/', {
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
            <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                    <User className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Register New Student</h2>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full pr-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm p-2 border"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student ID (Optional)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange}
                                className="block w-full pl-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm p-2 border"
                                placeholder="STU001"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Class Name</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <ClipboardList className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="class_name"
                                required
                                value={formData.class_name}
                                onChange={handleChange}
                                className="block w-full pl-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm p-2 border"
                                placeholder="10th Std"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                        <input
                            type="number"
                            name="roll_no"
                            required
                            value={formData.roll_no}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm p-2 border"
                            placeholder="1"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    >
                        {isLoading ? 'Registering...' : 'Register Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterStudent;
