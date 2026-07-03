import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import { FileText, Users, Bell, AlertCircle, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const AdminDashboard = () => {
    const { data, isLoading, isError } = useQuery('admin-dashboard-stats', adminAPI.getDashboardStats);
    const stats = data?.data?.stats || {};
    const { overview, byStatus, byCategory, byPriority } = stats;

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;
    if (isError) return <div className="text-center py-12 text-red-400">Failed to load dashboard data.</div>;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const priorityDot = (p) => ({ High: 'bg-red-400', Medium: 'bg-yellow-400', Low: 'bg-blue-400' }[p] || 'bg-gray-500');
    const priorityText = (p) => ({ High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-blue-400' }[p] || 'text-gray-400');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Monitor and manage all society maintenance activities</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Complaints', value: overview?.total || 0, icon: FileText, color: 'blue' },
                    { label: 'Overdue', value: overview?.overdue || 0, icon: AlertCircle, color: 'red' },
                    { label: 'Recent (7d)', value: overview?.recent || 0, icon: TrendingUp, color: 'yellow' },
                    { label: 'Resolved', value: overview?.resolved || 0, icon: CheckCircle, color: 'green' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
                            <p className={`text-3xl font-bold mt-1 ${color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'green' ? 'text-green-400' : 'text-white'}`}>{value}</p>
                        </div>
                        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
                            <Icon className={`w-5 h-5 text-${color}-400`} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">By Status</h3>
                    <div className="space-y-3">
                        {Object.entries(byStatus || {}).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {getStatusIcon(status)}
                                    <span className="text-sm text-gray-300">{status}</span>
                                </div>
                                <span className="text-sm font-semibold text-white">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">By Priority</h3>
                    <div className="space-y-3">
                        {Object.entries(byPriority || {}).map(([priority, count]) => (
                            <div key={priority} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${priorityDot(priority)}`} />
                                    <span className="text-sm text-gray-300">{priority}</span>
                                </div>
                                <span className={`text-sm font-semibold ${priorityText(priority)}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">By Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(byCategory || {}).map(([category, count]) => (
                        <div key={category} className="bg-gray-900/60 rounded-xl p-4 text-center border border-gray-700/50">
                            <p className="text-2xl font-bold text-white">{count}</p>
                            <p className="text-xs text-gray-500 mt-1">{category}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { to: '/admin/complaints', icon: FileText, color: 'blue', label: 'Manage Complaints', desc: 'Update status, assign priorities, track progress' },
                    { to: '/admin/notices', icon: Bell, color: 'green', label: 'Manage Notices', desc: 'Create and publish important announcements' },
                    { to: '/admin/users', icon: Users, color: 'purple', label: 'User Management', desc: 'Manage resident accounts and permissions' },
                ].map(({ to, icon: Icon, color, label, desc }) => (
                    <Link key={to} to={to} className="card p-5 hover:bg-gray-700/40 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className={`p-2.5 bg-${color}-500/10 rounded-xl`}>
                                    <Icon className={`w-5 h-5 text-${color}-400`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{label}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{desc}</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1" />
                        </div>
                    </Link>
                ))}
            </div>

            {overview?.overdue > 0 && (
                <div className="card p-4 border-red-500/30 bg-red-500/5">
                    <div className="flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">
                            <span className="font-semibold">{overview.overdue} overdue complaint{overview.overdue > 1 ? 's' : ''}</span> need immediate attention.
                            <Link to="/admin/complaints" className="ml-2 underline hover:no-underline">View now →</Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
