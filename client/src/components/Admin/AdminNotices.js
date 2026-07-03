import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { noticeAPI } from '../../services/api';
import { Bell, Plus, Trash2, Pin, X, AlertCircle, Calendar, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const categoryOptions = ['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'];

const getCategoryBadge = (c) => ({
    Emergency: 'bg-red-500/20 text-red-400 border-red-500/30',
    Maintenance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Events: 'bg-green-500/20 text-green-400 border-green-500/30',
    Rules: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}[c] || 'bg-gray-700/50 text-gray-400 border-gray-600');

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const AdminNotices = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: 'General', isImportant: false, isPinned: false, expiresAt: '' });
    const [errors, setErrors] = useState({});

    const { data, isLoading } = useQuery('admin-notices', () => noticeAPI.getNotices({ limit: 50 }));
    const notices = data?.data?.notices || [];

    const createMutation = useMutation(
        (data) => noticeAPI.createNotice(data),
        {
            onSuccess: () => {
                toast.success('Notice published successfully!');
                queryClient.invalidateQueries('admin-notices');
                setShowForm(false);
                setForm({ title: '', content: '', category: 'General', isImportant: false, isPinned: false, expiresAt: '' });
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish notice'),
        }
    );

    const deleteMutation = useMutation(
        (id) => noticeAPI.deleteNotice(id),
        {
            onSuccess: () => { toast.success('Notice deleted'); queryClient.invalidateQueries('admin-notices'); },
            onError: () => toast.error('Failed to delete notice'),
        }
    );

    const pinMutation = useMutation(
        ({ id, isPinned }) => noticeAPI.updateNotice(id, { isPinned }),
        {
            onSuccess: () => queryClient.invalidateQueries('admin-notices'),
            onError: () => toast.error('Failed to update notice'),
        }
    );

    const validate = () => {
        const e = {};
        if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters';
        if (!form.content.trim() || form.content.length < 10) e.content = 'Content must be at least 10 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = { ...form };
        if (!payload.expiresAt) delete payload.expiresAt;
        createMutation.mutate(payload);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manage Notices</h1>
                    <p className="text-gray-400 text-sm mt-1">Publish and manage society announcements</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus size={15} /> New Notice
                </button>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="card w-full max-w-lg p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Publish New Notice</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Notice title"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="form-label">Content *</label>
                                <textarea
                                    rows={4}
                                    className="form-input resize-none"
                                    placeholder="Write the notice content..."
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                />
                                {errors.content && <p className="mt-1 text-xs text-red-400">{errors.content}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Category</label>
                                    <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Expires On <span className="text-gray-600">(Optional)</span></label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.expiresAt}
                                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isImportant} onChange={(e) => setForm({ ...form, isImportant: e.target.checked })} className="w-4 h-4 rounded accent-red-500" />
                                    <span className="text-sm text-gray-300">Mark as Important</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="w-4 h-4 rounded accent-blue-500" />
                                    <span className="text-sm text-gray-300">Pin to top</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline flex-1">Cancel</button>
                                <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                    {createMutation.isLoading ? <><LoadingSpinner size="sm" />Publishing...</> : <><Bell size={14} />Publish Notice</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notices List */}
            {isLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : notices.length === 0 ? (
                <div className="card py-16 text-center">
                    <Bell className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-gray-400 font-medium">No notices yet</p>
                    <p className="text-gray-600 text-sm mt-1">Click "New Notice" to publish your first announcement.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notices.map((notice) => (
                        <div key={notice._id} className={`card p-5 ${notice.isPinned ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {notice.isPinned && <Pin size={13} className="text-blue-400 flex-shrink-0" />}
                                        <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                                        {notice.isImportant && <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Important</span>}
                                        <span className={`badge border text-xs ${getCategoryBadge(notice.category)}`}>{notice.category}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{notice.content}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-600">
                                        <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(notice.createdAt)}</span>
                                        <span className="flex items-center gap-1"><Eye size={11} />{notice.viewCount} views</span>
                                        {notice.expiresAt && <span className="flex items-center gap-1 text-yellow-600"><AlertCircle size={11} />Expires {formatDate(notice.expiresAt)}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => pinMutation.mutate({ id: notice._id, isPinned: !notice.isPinned })}
                                        className={`p-2 rounded-lg transition-colors ${notice.isPinned ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20' : 'text-gray-500 hover:text-blue-400 hover:bg-gray-700'}`}
                                        title={notice.isPinned ? 'Unpin' : 'Pin to top'}
                                    >
                                        <Pin size={15} />
                                    </button>
                                    <button
                                        onClick={() => { if (window.confirm('Delete this notice?')) deleteMutation.mutate(notice._id); }}
                                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Delete notice"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminNotices;
