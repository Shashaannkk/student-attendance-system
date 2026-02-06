import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Link2 } from 'lucide-react';
import { API_URL } from '../config';
import TeacherInviteManager from '../components/TeacherInviteManager';

const RegisterUser = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'manual' | 'invite'>('invite');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'teacher'>('teacher');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied: Admins only.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${API_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, password, role })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            setMessage({ type: 'success', text: `User ${username} created successfully as ${role}!` });
            setUsername('');
            setPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">Manage Teachers</h1>
                    </div>
                    <p className="text-indigo-100">Add teachers manually or send them invite links</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('invite')}
                            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'invite'
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Link2 className="w-5 h-5" />
                                Invite Links (Recommended)
                            </div>
                            {activeTab === 'invite' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${activeTab === 'manual'
                                ? 'text-indigo-600 bg-indigo-50'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Manual Registration
                            </div>
                            {activeTab === 'manual' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'invite' ? (
                        <TeacherInviteManager />
                    ) : (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create User Manually</h2>

                            {message && (
                                <div className={`mb-4 p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as 'admin' | 'teacher')}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="teacher">Teacher</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {isLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterUser;
