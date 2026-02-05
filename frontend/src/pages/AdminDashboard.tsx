import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { Users, Building2, Calendar, Search } from 'lucide-react';

interface Organization {
    org_code: string;
    institution_name: string;
    institution_type: string;
    email: string;
    created_at: string;
}

interface User {
    username: string;
    org_code: string;
    role: string;
    institution_name: string;
    institution_type: string;
    profile_picture_url: string | null;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'organizations' | 'users'>('organizations');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch organizations
            const orgsResponse = await fetch(`${API_URL}/admin/organizations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (orgsResponse.ok) {
                const orgsData = await orgsResponse.json();
                setOrganizations(orgsData);
            }

            // Fetch users
            const usersResponse = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter organizations based on search
    const filteredOrganizations = organizations.filter(org =>
        org.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.org_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter users based on search
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.org_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.institution_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading admin data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage and view all system registrations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
                                <p className="text-3xl font-bold text-gray-800">{organizations.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-gray-800">{users.length}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Recent Registrations</p>
                                <p className="text-3xl font-bold text-gray-800">
                                    {organizations.filter(org => {
                                        const createdDate = new Date(org.created_at);
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return createdDate > weekAgo;
                                    }).length}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('organizations')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'organizations'
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Organizations ({organizations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'users'
                                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Users ({users.length})
                        </button>
                    </div>

                    {/* Organizations Table */}
                    {activeTab === 'organizations' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Organization Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Institution Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registered
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrganizations.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No organizations found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrganizations.map((org) => (
                                            <tr key={org.org_code} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-gray-900">{org.org_code}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{org.institution_name}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${org.institution_type === 'school'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {org.institution_type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {org.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(org.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Users Table */}
                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Organization
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Org Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, index) => (
                                            <tr key={`${u.org_code}-${u.username}-${index}`} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">{u.username}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.role === 'admin'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {u.institution_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-gray-600">{u.org_code}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${u.institution_type === 'school'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {u.institution_type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
