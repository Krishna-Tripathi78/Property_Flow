import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import { Users, Search, Shield, Home, Phone, Mail, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const UserManagement = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const { data, isLoading, isError } = useQuery('admin-users', adminAPI.getUsers);
    const users = data?.data?.users || [];

    const toggleMutation = useMutation(
        ({ id, isActive }) => adminAPI.updateUserStatus(id, { isActive }),
        {
            onSuccess: (_, vars) => {
                toast.success(`User ${vars.isActive ? 'activated' : 'deactivated'} successfully`);
                queryClient.invalidateQueries('admin-users');
            },
            onError: () => toast.error('Failed to update user status'),
        }
    );

    const filtered = users.filter(u => {
        const matchSearch = !search ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.apartmentNumber?.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const totalResidents = users.filter(u => u.role === 'resident').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const activeUsers = users.filter(u => u.isActive).length;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;
    if (isError) return <div className="text-center py-12 text-red-400">Failed to load users.</div>;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-gray-400 text-sm mt-1">Manage resident and admin accounts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Users</p>
                        <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                    </div>
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                </div>
                <div className="card p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Residents</p>
                        <p className="text-2xl font-bold text-white mt-1">{totalResidents}</p>
                    </div>
                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                        <Home className="w-5 h-5 text-purple-400" />
                    </div>
                </div>
                <div className="card p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">{activeUsers}</p>
                    </div>
                    <div className="p-2.5 bg-green-500/10 rounded-xl">
                        <Shield className="w-5 h-5 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by name, email or apartment..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input pl-10"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="form-input sm:w-40"
                >
                    <option value="">All Roles</option>
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="card">
                {filtered.length > 0 ? (
                    <div className="divide-y divide-gray-700/50">
                        {filtered.map((user) => (
                            <div key={user._id} className="px-6 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                        user.role === 'admin'
                                            ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-black'
                                            : 'bg-gradient-to-br from-blue-500 to-violet-600 text-white'
                                    }`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-white">{user.name}</p>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                                {user.role === 'admin' ? <Shield size={10} /> : <Home size={10} />}
                                                {user.role}
                                            </span>
                                            {!user.isActive && (
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Mail size={11} />{user.email}</span>
                                            {user.apartmentNumber && <span className="flex items-center gap-1"><Home size={11} />Apt {user.apartmentNumber}</span>}
                                            {user.phoneNumber && <span className="flex items-center gap-1"><Phone size={11} />{user.phoneNumber}</span>}
                                            <span className="flex items-center gap-1"><Calendar size={11} />Joined {formatDate(user.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle */}
                                <button
                                    onClick={() => toggleMutation.mutate({ id: user._id, isActive: !user.isActive })}
                                    disabled={toggleMutation.isLoading}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        user.isActive
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'
                                    }`}
                                    title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                                >
                                    {user.isActive
                                        ? <><ToggleRight size={15} /> Active</>
                                        : <><ToggleLeft size={15} /> Inactive</>
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Users className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                        <p className="text-gray-400 font-medium">No users found</p>
                        <p className="text-gray-600 text-sm mt-1">{search || roleFilter ? 'Try adjusting your search.' : 'No users registered yet.'}</p>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-600 text-center">
                Showing {filtered.length} of {users.length} users
            </p>
        </div>
    );
};

export default UserManagement;
