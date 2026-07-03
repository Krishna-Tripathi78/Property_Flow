import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { complaintAPI } from '../../services/api';
import {
    ArrowLeft, AlertCircle, Clock, CheckCircle,
    Calendar, User, Tag, Image, History, MapPin
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const ComplaintDetails = () => {
    const { id } = useParams();

    const { data, isLoading, isError } = useQuery(
        ['complaint', id],
        () => complaintAPI.getComplaint(id)
    );

    const complaint = data?.data?.complaint;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle className="w-4 h-4 text-red-400" />;
            case 'In Progress': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'Resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            default: return null;
        }
    };

    const getStatusBadge = (s) => ({
        'Open': 'bg-red-500/20 text-red-400 border border-red-500/30',
        'In Progress': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'Resolved': 'bg-green-500/20 text-green-400 border border-green-500/30',
    }[s] || 'bg-gray-700 text-gray-300');

    const getPriorityBadge = (p) => ({
        'High': 'bg-red-500/20 text-red-400 border border-red-500/30',
        'Medium': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        'Low': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    }[p] || 'bg-gray-700 text-gray-300');

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const formatShortDate = (d) => new Date(d).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-64">
            <LoadingSpinner size="lg" />
        </div>
    );

    if (isError || !complaint) return (
        <div className="max-w-4xl mx-auto space-y-5">
            <Link to="/complaints" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Back to complaints
            </Link>
            <div className="card p-12 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">Complaint not found</p>
                <p className="text-gray-600 text-sm mt-1">This complaint may have been removed or you don't have access.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-5">
            {/* Back + Header */}
            <div className="flex items-center gap-3">
                <Link to="/complaints" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-white truncate">{complaint.title}</h1>
                    <p className="text-gray-500 text-xs mt-0.5">Submitted {formatShortDate(complaint.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(complaint.priority)}`}>
                        {complaint.priority} Priority
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Description */}
                    <div className="card p-6">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Description</h2>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {/* Photos */}
                    {complaint.photos && complaint.photos.length > 0 && (
                        <div className="card p-6">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Image size={14} /> Photos ({complaint.photos.length})
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {complaint.photos.map((photo, i) => (
                                    <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={photo.url}
                                            alt={`Photo ${i + 1}`}
                                            className="w-full aspect-square object-cover rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* History / Timeline */}
                    <div className="card p-6">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History size={14} /> Status History
                        </h2>
                        {complaint.history && complaint.history.length > 0 ? (
                            <div className="space-y-4">
                                {[...complaint.history].reverse().map((entry, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                                                {getStatusIcon(entry.status)}
                                            </div>
                                            {i < complaint.history.length - 1 && (
                                                <div className="w-px flex-1 bg-gray-700/50 mt-2" />
                                            )}
                                        </div>
                                        <div className="pb-4 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(entry.status)}`}>
                                                    {entry.status}
                                                </span>
                                                <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                                            </div>
                                            {entry.note && (
                                                <p className="text-sm text-gray-300 mt-1.5">{entry.note}</p>
                                            )}
                                            {entry.changedBy && (
                                                <p className="text-xs text-gray-600 mt-1">
                                                    by {entry.changedBy.name || 'System'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No status updates yet.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Details */}
                    <div className="card p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Details</h2>

                        <div className="flex items-start gap-3">
                            <Tag size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="text-sm text-white font-medium">{complaint.category}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Submitted by</p>
                                <p className="text-sm text-white font-medium">{complaint.resident?.name || 'You'}</p>
                                {complaint.resident?.apartmentNumber && (
                                    <p className="text-xs text-gray-500">Apt {complaint.resident.apartmentNumber}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Submitted on</p>
                                <p className="text-sm text-white font-medium">{formatShortDate(complaint.createdAt)}</p>
                            </div>
                        </div>

                        {complaint.dueDate && (
                            <div className="flex items-start gap-3">
                                <Clock size={14} className={`mt-0.5 flex-shrink-0 ${complaint.isOverdue ? 'text-red-400' : 'text-gray-500'}`} />
                                <div>
                                    <p className="text-xs text-gray-500">Due date</p>
                                    <p className={`text-sm font-medium ${complaint.isOverdue ? 'text-red-400' : 'text-white'}`}>
                                        {formatShortDate(complaint.dueDate)}
                                    </p>
                                    {complaint.isOverdue && (
                                        <p className="text-xs text-red-500 mt-0.5">Overdue</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {complaint.resolvedAt && (
                            <div className="flex items-start gap-3">
                                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Resolved on</p>
                                    <p className="text-sm text-green-400 font-medium">{formatShortDate(complaint.resolvedAt)}</p>
                                </div>
                            </div>
                        )}

                        {complaint.assignedTo && (
                            <div className="flex items-start gap-3">
                                <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500">Assigned to</p>
                                    <p className="text-sm text-white font-medium">{complaint.assignedTo.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Overdue warning */}
                    {complaint.isOverdue && complaint.status !== 'Resolved' && (
                        <div className="card p-4 border-red-500/30 bg-red-500/5">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300">This complaint is overdue. The admin has been notified.</p>
                            </div>
                        </div>
                    )}

                    {/* Resolved banner */}
                    {complaint.status === 'Resolved' && (
                        <div className="card p-4 border-green-500/30 bg-green-500/5">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                                <p className="text-xs text-green-300">This complaint has been resolved. Thank you for your patience.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
