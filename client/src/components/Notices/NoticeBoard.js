import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { noticeAPI } from '../../services/api';
import { Bell, Pin, Calendar, User, Eye, SlidersHorizontal } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const NoticeBoard = () => {
    const [filters, setFilters] = useState({ category: '' });
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError } = useQuery(
        ['notices', filters, currentPage],
        () => noticeAPI.getNotices({ ...filters, page: currentPage, limit: 10 }),
        { keepPreviousData: true }
    );

    const notices = data?.data?.notices || [];
    const pagination = data?.data?.pagination || {};
    const categoryOptions = ['General', 'Maintenance', 'Events', 'Rules', 'Emergency', 'Other'];

    const getCategoryBadge = (category) => ({
        Emergency: 'badge bg-red-500/20 text-red-400 border border-red-500/30',
        Maintenance: 'badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        Events: 'badge bg-green-500/20 text-green-400 border border-green-500/30',
        Rules: 'badge bg-blue-500/20 text-blue-400 border border-blue-500/30',
    }[category] || 'badge bg-gray-700 text-gray-400');

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (isLoading) return <div className="flex justify-center items-center min-h-64"><LoadingSpinner size="lg" /></div>;

    if (isError) return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Notice Board</h1>
                <p className="text-gray-400 text-sm mt-1">Stay updated with the latest announcements</p>
            </div>
            <div className="card py-20 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-700 mb-4" />
                <p className="text-base font-semibold text-gray-300">No new notices yet</p>
                <p className="text-sm text-gray-600 mt-1">Check back later for society announcements and updates.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Notice Board</h1>
                    <p className="text-gray-400 text-sm mt-1">Stay updated with the latest announcements</p>
                </div>
                <div className="flex items-center space-x-2">
                    <SlidersHorizontal size={15} className="text-gray-500" />
                    <select
                        value={filters.category}
                        onChange={(e) => { setFilters({ category: e.target.value }); setCurrentPage(1); }}
                        className="form-input w-auto"
                    >
                        <option value="">All Categories</option>
                        {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {notices.length > 0 ? (
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <div key={notice._id} className={`card p-6 ${notice.isPinned ? 'border-blue-500/40 bg-blue-500/5' : ''}`}>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    {notice.isPinned && <Pin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="text-base font-semibold text-white">{notice.title}</h2>
                                            {notice.isImportant && (
                                                <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Important</span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><User size={11} />{notice.author?.name || 'Admin'}</span>
                                            <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(notice.createdAt)}</span>
                                            <span className="flex items-center gap-1"><Eye size={11} />{notice.viewCount} views</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={getCategoryBadge(notice.category)}>{notice.category}</span>
                            </div>

                            <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{notice.content}</p>

                            {notice.expiresAt && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                                    <Calendar size={12} />
                                    <span>Expires {new Date(notice.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {pagination.totalPages > 1 && (
                        <div className="card p-4 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {((pagination.currentPage - 1) * 10) + 1}–{Math.min(pagination.currentPage * 10, pagination.totalNotices)} of {pagination.totalNotices}
                            </p>
                            <div className="flex space-x-2">
                                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={!pagination.hasPrev} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Previous</button>
                                <button onClick={() => setCurrentPage(p => p + 1)} disabled={!pagination.hasNext} className="btn btn-outline text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="card py-16 text-center">
                    <Bell className="mx-auto h-10 w-10 text-gray-600" />
                    <p className="mt-3 text-sm font-medium text-gray-400">No notices found</p>
                    <p className="text-xs text-gray-600 mt-1">{filters.category ? 'No notices in this category.' : 'No notices have been posted yet.'}</p>
                </div>
            )}
        </div>
    );
};

export default NoticeBoard;
