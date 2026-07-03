import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { complaintAPI } from '../../services/api';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Bell, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const Dashboard = () => {
    const { user } = useAuth();

    const { data: complaintsData, isLoading } = useQuery(
        ['complaints', 'recent'],
        () => complaintAPI.getComplaints({ limit: 5 }),
        { enabled: !!user }
    );

    const complaints = complaintsData?.data?.complaints || [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Open': return 'badge badge-open';
            case 'In Progress': return 'badge badge-in-progress';
            case 'Resolved': return 'badge badge-resolved';
            default: return 'badge bg-gray-700 text-gray-300';
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'High': return 'badge badge-high';
            case 'Medium': return 'badge badge-medium';
            case 'Low': return 'badge badge-low';
            default: return 'badge bg-gray-700 text-gray-300';
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;

    const total = complaintsData?.data?.pagination?.totalComplaints || 0;
    const active = complaints.filter(c => c.status !== 'Resolved').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Welcome back, {user.name} 👋</h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            {user.role === 'admin'
                                ? 'Manage complaints and keep your society running smoothly.'
                                : `Apartment ${user.apartmentNumber} · Stay updated on your complaints and notices.`}
                        </p>
                    </div>
                    {user.role === 'resident' && (
                        <Link to="/complaints/new" className="btn btn-primary flex items-center space-x-2">
                            <Plus size={15} />
                            <span>New Complaint</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Complaints</p>
                        <p className="text-3xl font-bold text-white mt-1">{total}</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                </div>
                <div className="card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
                        <p className="text-3xl font-bold text-white mt-1">{active}</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-xl">
                        <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                </div>
                <div className="card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
                        <p className="text-3xl font-bold text-white mt-1">{resolved}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Recent Complaints */}
            <div className="card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <h2 className="text-base font-semibold text-white">Recent Complaints</h2>
                    <Link to="/complaints" className="text-sm text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors">
                        <span>View all</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {complaints.length > 0 ? (
                    <div className="divide-y divide-gray-700/50">
                        {complaints.map((complaint) => (
                            <Link
                                key={complaint._id}
                                to={`/complaints/${complaint._id}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-700/30 transition-colors"
                            >
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <div className="mt-0.5 flex-shrink-0">{getStatusIcon(complaint.status)}</div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{complaint.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{complaint.category} · {formatDate(complaint.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                    <span className={getStatusBadge(complaint.status)}>{complaint.status}</span>
                                    <span className={getPriorityBadge(complaint.priority)}>{complaint.priority}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <FileText className="mx-auto h-10 w-10 text-gray-600" />
                        <p className="mt-3 text-sm font-medium text-gray-400">No complaints yet</p>
                        {user.role === 'resident' && (
                            <Link to="/complaints/new" className="btn btn-primary mt-4 inline-flex">
                                Submit your first complaint
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Bell className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Notice Board</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Latest announcements and notices</p>
                        </div>
                    </div>
                    <Link to="/notices" className="btn btn-outline text-xs px-3 py-1.5">View</Link>
                </div>

                {user.role === 'admin' && (
                    <div className="card p-5 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Admin Panel</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Manage complaints, users, and settings</p>
                            </div>
                        </div>
                        <Link to="/admin" className="btn btn-outline text-xs px-3 py-1.5">Open</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
