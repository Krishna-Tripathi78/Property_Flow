import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { complaintAPI } from '../../services/api';
import { AlertCircle, Clock, CheckCircle, FileText, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const statusOptions = ['Open', 'In Progress', 'Resolved'];
const priorityOptions = ['Low', 'Medium', 'High'];
const categoryOptions = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Common Area', 'Water Supply', 'Other'];

const getStatusBadge = (s) => ({ Open: 'bg-red-500/20 text-red-400 border-red-500/30', 'In Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', Resolved: 'bg-green-500/20 text-green-400 border-green-500/30' }[s] || 'bg-gray-700 text-gray-300 border-gray-600');
const getPriorityBadge = (p) => ({ High: 'bg-red-500/20 text-red-400 border-red-500/30', Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }[p] || 'bg-gray-700 text-gray-300 border-gray-600');
const getStatusIcon = (s) => ({ Open: <AlertCircle className="w-4 h-4 text-red-400" />, 'In Progress': <Clock className="w-4 h-4 text-yellow-400" />, Resolved: <CheckCircle className="w-4 h-4 text-green-400" /> }[s] || <FileText className="w-4 h-4 text-gray-500" />);
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const AdminComplaints = () => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [selected, setSelected] = useState(null); // complaint being updated
    const [updateForm, setUpdateForm] = useState({ status: '', priority: '', note: '' });

    const { data, isLoading, isError } = useQuery(
        ['admin-complaints', filters, currentPage],
        () => {
            const cleanParams = Object.fromEntries(Object.entries({ ...filters, page: currentPage, limit: 10 }).filter(([_, v]) => v !== ''));
            return complaintAPI.getComplaints(cleanParams);
        },
        { keepPreviousData: true }
    );

    const complaints = data?.data?.complaints || [];
    const pagination = data?.data?.pagination || {};

    const updateMutation = useMutation(
        ({ id, data }) => complaintAPI.updateComplaint(id, data),
        {
            onSuccess: (res) => {
                toast.success(res.data.message || 'Complaint updated!');
                queryClient.invalidateQueries('admin-complaints');
                setSelected(null);
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to update complaint'),
        }
    );

    const openUpdate = (complaint) => {
        setSelected(complaint);
        setUpdateForm({ status: complaint.status, priority: complaint.priority, note: '' });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const payload = {};
        if (updateForm.status !== selected.status) payload.status = updateForm.status;
        if (updateForm.priority !== selected.priority) payload.priority = updateForm.priority;
        if (updateForm.note.trim()) payload.note = updateForm.note;
        if (Object.keys(payload).length === 0) { toast('No changes made'); return; }
        updateMutation.mutate({ id: selected._id, data: payload });
    };

    const handleFilterChange = (key, value) => { setFilters(p => ({ ...p, [key]: value })); setCurrentPage(1); };
    const clearFilters = () => { setFilters({ status: '', category: '', priority: '', search: '' }); setCurrentPage(1); };
    const hasFilters = Object.values(filters).some(Boolean);

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;
    if (isError) return <div className="text-center py-12 text-red-400">Failed to load complaints.</div>;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Manage Complaints</h1>
                <p className="text-gray-400 text-sm mt-1">View and update all resident complaints</p>
            </div>

            {/* Search & Filters */}
            <div className="card p-4 space-y-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input type="text" placeholder="Search complaints..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="form-input pl-10" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`btn flex items-center gap-2 ${showFilters || hasFilters ? 'btn-primary' : 'btn-outline'}`}>
                        <SlidersHorizontal size={15} /><span>Filters</span>
                        {hasFilters && <span className="bg-white/20 text-xs rounded-full px-1.5">!</span>}
                    </button>
                </div>
                {showFilters && (
                    <div className="pt-4 border-t border-gray-700 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div><label className="form-label">Status</label>
                                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="form-input">
                                    <option value="">All Statuses</option>
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div><label className="form-label">Category</label>
                                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="form-input">
                                    <option value="">All Categories</option>
                                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><label className="form-label">Priority</label>
                                <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className="form-input">
                                    <option value="">All Priorities</option>
                                    {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        {hasFilters && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"><X size={12} />Clear filters</button>}
                    </div>
                )}
            </div>

            {/* List */}
            <div className="card">
                {complaints.length > 0 ? (
                    <>
                        <div className="divide-y divide-gray-700/50">
                            {complaints.map((c) => (
                                <div key={c._id} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-700/20 transition-colors">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="mt-0.5 flex-shrink-0">{getStatusIcon(c.status)}</div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-white truncate">{c.title}</p>
                                                {c.isOverdue && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Overdue</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {c.category} · {formatDate(c.createdAt)}
                                                {c.resident && ` · ${c.resident.name} (Apt ${c.resident.apartmentNumber})`}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`badge border text-xs ${getStatusBadge(c.status)}`}>{c.status}</span>
                                        <span className={`badge border text-xs ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                                        <button onClick={() => openUpdate(c)} className="btn btn-outline text-xs px-3 py-1.5 flex items-center gap-1">
                                            Update <ChevronDown size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {pagination.totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                                <p className="text-xs text-gray-500">{((pagination.currentPage - 1) * 10) + 1}–{Math.min(pagination.currentPage * 10, pagination.totalComplaints)} of {pagination.totalComplaints}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={!pagination.hasPrev} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Previous</button>
                                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNext} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <FileText className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                        <p className="text-gray-400 font-medium">No complaints found</p>
                        <p className="text-gray-600 text-sm mt-1">{hasFilters ? 'Try adjusting your filters.' : 'No complaints submitted yet.'}</p>
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="card w-full max-w-md p-6 space-y-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-white">Update Complaint</h2>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{selected.title}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="form-label">Status</label>
                                <select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} className="form-input">
                                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Priority</label>
                                <select value={updateForm.priority} onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })} className="form-input">
                                    {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="form-label">Note <span className="text-gray-600">(Optional)</span></label>
                                <textarea
                                    rows={3}
                                    className="form-input resize-none"
                                    placeholder="Add a note for the resident e.g. 'Plumber scheduled for tomorrow'"
                                    value={updateForm.note}
                                    onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                                />
                            </div>

                            {updateForm.status === 'Resolved' && (
                                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-green-300">Marking as Resolved will notify the resident via email.</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setSelected(null)} className="btn btn-outline flex-1">Cancel</button>
                                <button type="submit" disabled={updateMutation.isLoading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                    {updateMutation.isLoading ? <><LoadingSpinner size="sm" />Saving...</> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminComplaints;
