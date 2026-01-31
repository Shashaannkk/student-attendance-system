import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, BookOpen, Users, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const { setSelection, resetSelection } = useAttendance();
    const navigate = useNavigate();

    // Local state for form
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Mock data for dropdowns (Ideally fetch from backend)
    const classes = ['1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std', '9th Std', '10th Std', '11th Science', '11th Commerce', '12th Science', '12th Commerce'];
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Commerce'];

    useEffect(() => {
        resetSelection(); // Clear previous selection on mount
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSelection({
            className,
            subject,
            date
        });
        navigate('/attendance');
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center pt-8">
                <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
                <p className="mt-2 text-gray-600">Select class details to mark attendance</p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Class Selection */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <Users className="w-4 h-4 mr-2 text-indigo-500" />
                                    Select Class
                                </label>
                                <select
                                    required
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border shadow-sm transition-shadow group-hover:shadow-md bg-white"
                                >
                                    <option value="">-- Choose Class --</option>
                                    {classes.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject Selection */}
                            <div className="relative group">
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2 text-pink-500" />
                                    Select Subject
                                </label>
                                <select
                                    required
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border shadow-sm transition-shadow group-hover:shadow-md bg-white"
                                >
                                    <option value="">-- Choose Subject --</option>
                                    {subjects.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="relative group max-w-md mx-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                Select Date
                            </label>
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg border shadow-sm transition-shadow group-hover:shadow-md text-center"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
                            >
                                Proceed to Attendance
                                <ArrowRight className="ml-2 -mr-1 h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
                Logged in as <span className="font-semibold text-gray-700">{user?.username}</span>
            </div>
        </div>
    );
};

export default Dashboard;
