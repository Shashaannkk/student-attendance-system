import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config';
import {
    User,
    Bell,
    Lock,
    Shield,
    Palette,
    Globe,
    LogOut,
    ChevronRight,
    Camera,
    Loader2
} from 'lucide-react';

const Settings = () => {
    const { user, login, logout } = useAuth(); // Need login to update user context, logout for sign out
    const [activeTab, setActiveTab] = useState('profile');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const institutionType = user?.institution_type || 'school';

    // Theme colors based on institution type
    const theme = {
        primary: institutionType === 'school' ? 'bg-blue-600' : 'bg-indigo-600',
        lightBg: institutionType === 'school' ? 'bg-blue-50' : 'bg-indigo-50',
        text: institutionType === 'school' ? 'text-blue-600' : 'text-indigo-600',
        border: institutionType === 'school' ? 'border-blue-100' : 'border-indigo-100',
        hover: institutionType === 'school' ? 'hover:bg-blue-50' : 'hover:bg-indigo-50'
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    ];

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('📸 Profile picture upload started');
        console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Basic validation
        if (!file.type.startsWith('image/')) {
            console.error('❌ Invalid file type:', file.type);
            alert('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            console.error('❌ File too large:', file.size, 'bytes');
            alert('File size must be less than 2MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const apiUrl = getApiUrl();
            const uploadUrl = `${apiUrl}/users/me/profile-picture`;

            console.log('📤 Uploading to:', uploadUrl);
            console.log('Token present:', !!token);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            console.log('📥 Response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
                console.error('❌ Upload failed:', errorData);
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data = await response.json();
            console.log('✅ Upload successful:', data);

            // Update user context with new profile picture
            if (user && token) {
                const updatedUser = { ...user, profile_picture_url: data.profile_picture_url };
                login(token, updatedUser); // This updates context and localStorage
                console.log('✅ User context updated with new profile picture');
                alert('Profile picture uploaded successfully!');
            }

        } catch (error) {
            console.error('❌ Error uploading profile picture:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to upload profile picture: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const getProfileImageUrl = () => {
        if (user?.profile_picture_url) {
            return `${getApiUrl()}${user.profile_picture_url}`;
        }
        return null;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                                <p className="text-gray-500 text-sm">Update your account's profile information and email address.</p>
                            </div>
                        </div>

                        {/* Profile Photo */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Profile Photo</h3>
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-full ${theme.primary} text-white flex items-center justify-center text-2xl font-bold overflow-hidden relative`}>
                                    {getProfileImageUrl() ? (
                                        <img
                                            src={getProfileImageUrl()!}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.username?.substring(0, 2).toUpperCase() || 'AD'
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-white" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className={`px-4 py-2 ${theme.lightBg} ${theme.text} rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mb-2 disabled:opacity-50`}
                                    >
                                        <Camera size={16} />
                                        {uploading ? 'Uploading...' : 'Change Photo'}
                                    </button>
                                    <p className="text-xs text-gray-400">JPG, GIF or PNG. 2MB Max.</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={user?.username}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <input
                                        type="text"
                                        value={user?.role}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 capitalize focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution Code</label>
                                    <input
                                        type="text"
                                        value={user?.org_code}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                                    <input
                                        type="text"
                                        value={user?.institution_name || 'N/A'}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button className={`px-6 py-2.5 ${theme.primary} text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all`}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Security & Password</h2>
                            <p className="text-gray-500 text-sm">Manage your password and security preferences.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">Change Password</h3>
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input type="password" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                </div>
                                <button className={`px-6 py-2.5 ${theme.primary} text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all`}>
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className={`w-16 h-16 ${theme.lightBg} rounded-full flex items-center justify-center mb-4`}>
                            <SettingsIcon className={theme.text} size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Coming Soon</h3>
                        <p className="text-gray-500 text-sm">This section is under development.</p>
                    </div>
                );
        }
    };

    // Helper component for coming soon icon
    const SettingsIcon = ({ className, size }: { className?: string, size?: number }) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-500">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                        <nav className="p-2 space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                                            ${isActive
                                                ? `${theme.lightBg} ${theme.text}`
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} />
                                            {tab.label}
                                        </div>
                                        {isActive && <ChevronRight size={16} />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="border-t border-gray-100 p-2 mt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-h-[500px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
