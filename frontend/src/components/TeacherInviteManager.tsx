import React, { useState, useEffect } from 'react';
import { Link2, Copy, Trash2, RefreshCw, UserPlus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

interface TeacherInvite {
    token: string;
    created_at: string;
    expires_at: string;
    used: boolean;
    used_at: string | null;
    used_by: string | null;
    is_expired: boolean;
    status: 'active' | 'expired' | 'used';
}

const TeacherInviteManager = () => {
    const { token } = useAuth();
    const [invites, setInvites] = useState<TeacherInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/teacher-invites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch invites');

            const data = await response.json();
            setInvites(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createInvite = async () => {
        setCreating(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/admin/create-teacher-invite`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to create invite');

            const data = await response.json();

            // Copy the full URL to clipboard
            const fullUrl = `${window.location.origin}/#/teacher-invite/${data.token}`;
            await navigator.clipboard.writeText(fullUrl);
            setCopiedToken(data.token);
            setTimeout(() => setCopiedToken(null), 3000);

            // Refresh the list
            await fetchInvites();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const revokeInvite = async (inviteToken: string) => {
        if (!confirm('Are you sure you want to revoke this invite?')) return;

        try {
            const response = await fetch(`${API_URL}/admin/teacher-invites/${inviteToken}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to revoke invite');

            // Refresh the list
            await fetchInvites();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const copyInviteLink = async (inviteToken: string) => {
        const fullUrl = `${window.location.origin}/#/teacher-invite/${inviteToken}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopiedToken(inviteToken);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const getStatusBadge = (invite: TeacherInvite) => {
        if (invite.used) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Used
                </span>
            );
        }
        if (invite.is_expired) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle className="w-3 h-3" />
                    Expired
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3" />
                Active
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Teacher Invites</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Generate invite links for teachers to self-register
                    </p>
                </div>
                <button
                    onClick={createInvite}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <UserPlus className="w-5 h-5" />
                    {creating ? 'Creating...' : 'Create Invite Link'}
                </button>
            </div>

            {/* Success message */}
            {copiedToken && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">Invite link copied to clipboard!</p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Invites List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {invites.length === 0 ? (
                    <div className="text-center py-12">
                        <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No invites created yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Click "Create Invite Link" to generate your first invite
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Expires
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Used By
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invites.map((invite) => (
                                    <tr key={invite.token} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invite)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(invite.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(invite.expires_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {invite.used_by || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {invite.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => copyInviteLink(invite.token)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                                            title="Copy invite link"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            {copiedToken === invite.token ? 'Copied!' : 'Copy'}
                                                        </button>
                                                        <button
                                                            onClick={() => revokeInvite(invite.token)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                                            title="Revoke invite"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Revoke
                                                        </button>
                                                    </>
                                                )}
                                                {invite.status !== 'active' && (
                                                    <button
                                                        onClick={() => revokeInvite(invite.token)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                        title="Delete invite"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">How it works:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Click "Create Invite Link" to generate a new invite</li>
                            <li>The link is automatically copied to your clipboard</li>
                            <li>Share the link with the teacher you want to invite</li>
                            <li>The link expires after 30 minutes</li>
                            <li>Each link can only be used once</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherInviteManager;
