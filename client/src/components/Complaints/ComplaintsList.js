import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, SlidersHorizontal, FileText, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const ComplaintsList = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading, isError } = useQuery(
        ['complaints', filters, currentPage],
        () => complaintAPI.getComplaints({ ...filters, page: currentPage, limit: 10 }),
        { keepPreviousData: true }
    );

    const complaints = data?.data?.complaints || [];
    const pagination = data?.data?.pagination || {};

    const statusOptions = ['Open', 'In Progress', 'Resolved'];
    const categoryOptions = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Common Area', 'Water Supply', 'Other'];
    const priorityOptions = ['Low', 'Medium', 'High'];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            default: return <FileText className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (s) => ({ Open: 'badge badge-open', 'In Progress': 'badge badge-in-progress', Resolved: 'badge badge-resolved' }[s] || 'badge bg-gray-700 text-gray-300');
    const getPriorityBadge = (p) => ({ High: 'badge badge-high', Medium: 'badge badge-medium', Low: 'badge badge-low' }[p] || 'badge bg-gray-700 text-gray-300');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleFilterChange = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setCurrentPage(1); };
    const clearFilters = () => { setFilters({ status: '', category: '', priority: '', search: '' }); setCurrentPage(1); };
    const hasActiveFilters = Object.values(filters).some(Boolean);

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;
    if (isError) return <div className="text-center py-12 text-red-400">Failed to load complaints. Please try again.</div>;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">{user.role === 'admin' ? 'All Complaints' : 'My Complaints'}</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {user.role === 'admin' ? 'Manage and track all resident complaints' : 'Track your submitted complaints and their progress'}
                    </p>
                </div>
                {user.role === 'resident' && (
                    <Link to="/complaints/new" className="btn btn-primary flex items-center space-x-2">
                        <Plus size={15} />
                        <span>New Complaint</span>
                    </Link>
                )}
            </div>

            {/* Search & Filters */}
            <div className="card p-4 space-y-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="form-input pl-10"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn flex items-center space-x-2 ${showFilters || hasActiveFilters ? 'btn-primary' : 'btn-outline'}`}
                    >
                        <SlidersHorizontal size={15} />
                        <span>Filters</span>
                        {hasActiveFilters && <span className="bg-white/20 text-xs rounded-full px-1.5">!</span>}
                    </button>
                </div>

                {showFilters && (
                    <div className="pt-4 border-t border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="form-label">Status</label>
                                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="form-input">
                                    <option value="">All Statuses</option>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Category</label>
                                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="form-input">
                                    <option value="">All Categories</option>
                                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Priority</label>
                                <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="form-input">
                                    <option value="">All Priorities</option>
                                    {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors">
                                <X size={12} />
                                <span>Clear all filters</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="card">
                {complaints.length > 0 ? (
                    <>
                        <div className="divide-y divide-gray-700/50">
                            {complaints.map((complaint) => (
                                <Link
                                    key={complaint._id}
                                    to={`/complaints/${complaint._id}`}
                                    className="block px-6 py-4 hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                                            <div className="mt-0.5 flex-shrink-0">{getStatusIcon(complaint.status)}</div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-semibold text-white truncate">{complaint.title}</h3>
                                                    {complaint.isOverdue && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Overdue</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {complaint.category} · {formatDate(complaint.createdAt)}
                                                    {user.role === 'admin' && complaint.resident && ` · ${complaint.resident.name} (${complaint.resident.apartmentNumber})`}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1.5 line-clamp-1">{complaint.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className={getStatusBadge(complaint.status)}>{complaint.status}</span>
                                            <span className={getPriorityBadge(complaint.priority)}>{complaint.priority}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {((pagination.currentPage - 1) * 10) + 1}–{Math.min(pagination.currentPage * 10, pagination.totalComplaints)} of {pagination.totalComplaints}
                                </p>
                                <div className="flex space-x-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={!pagination.hasPrev} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Previous</button>
                                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNext} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <FileText className="mx-auto h-10 w-10 text-gray-600" />
                        <p className="mt-3 text-sm font-medium text-gray-400">No complaints found</p>
                        <p className="text-xs text-gray-600 mt-1">
                            {hasActiveFilters ? 'Try adjusting your filters.' : user.role === 'resident' ? "You haven't submitted any complaints yet." : 'No complaints submitted yet.'}
                        </p>
                        {user.role === 'resident' && !hasActiveFilters && (
                            <Link to="/complaints/new" className="btn btn-primary mt-4 inline-flex">Submit your first complaint</Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsList;
