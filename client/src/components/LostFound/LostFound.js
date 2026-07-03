import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { lostFoundAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    Search, Plus, X, Upload, MapPin, Phone,
    Tag, Eye, CheckCircle, Clock, Sparkles, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const typeOptions = ['lost', 'found'];
const categoryOptions = ['Electronics', 'Clothing', 'Keys', 'Documents', 'Jewelry', 'Books', 'Sports', 'Toys', 'Other'];

const typeBadge = (t) => t === 'lost'
    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
    : 'bg-green-500/20 text-green-400 border border-green-500/30';

const statusBadge = (s) => ({
    active: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    resolved: 'bg-gray-700 text-gray-400 border border-gray-600',
}[s] || 'bg-gray-700 text-gray-400');

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const LostFound = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ type: '', category: '', search: '' });
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', type: 'lost', location: '', contactInfo: '' });
    const [photos, setPhotos] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const { data, isLoading } = useQuery(
        ['lostfound', filters],
        () => lostFoundAPI.getItems(filters),
        { keepPreviousData: true }
    );

    const items = data?.data?.items || [];

    const createMutation = useMutation(
        (formData) => lostFoundAPI.createItem(formData),
        {
            onSuccess: (res) => {
                toast.success('Item posted successfully!');
                if (res.data.analysis) setAnalysis(res.data.analysis);
                queryClient.invalidateQueries('lostfound');
                resetForm();
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to post item'),
        }
    );

    const claimMutation = useMutation(
        (id) => lostFoundAPI.claimItem(id),
        {
            onSuccess: () => {
                toast.success('Item claimed successfully!');
                queryClient.invalidateQueries('lostfound');
                setSelectedItem(null);
            },
            onError: (err) => toast.error(err.response?.data?.message || 'Failed to claim item'),
        }
    );

    const markResolved = useMutation(
        (id) => lostFoundAPI.updateItem(id, { status: 'resolved' }),
        {
            onSuccess: () => {
                toast.success('Marked as resolved!');
                queryClient.invalidateQueries('lostfound');
                setSelectedItem(null);
            },
            onError: () => toast.error('Failed to update'),
        }
    );

    const resetForm = () => {
        setForm({ title: '', description: '', type: 'lost', location: '', contactInfo: '' });
        setPhotos([]);
        setAnalysis(null);
        setFormErrors({});
        setShowForm(false);
    };

    // Auto-analyze description using backend keyword analysis
    const handleDescriptionChange = async (val) => {
        setForm(f => ({ ...f, description: val }));
        if (val.length > 20) {
            setAnalyzing(true);
            try {
                const res = await lostFoundAPI.searchSimilar(val, form.type);
                // just trigger analysis feel — actual category suggestion comes on submit
            } catch (_) {}
            setAnalyzing(false);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
        if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('type', form.type);
        if (form.location) fd.append('location', form.location);
        if (form.contactInfo) fd.append('contactInfo', form.contactInfo);
        photos.forEach(p => fd.append('photos', p));
        createMutation.mutate(fd);
    };

    const handleFiles = (files) => {
        const valid = Array.from(files).filter(f => {
            if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
            if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
            return true;
        }).slice(0, 3 - photos.length);
        setPhotos(p => [...p, ...valid]);
    };

    const filteredItems = items.filter(item => {
        if (filters.search) {
            const s = filters.search.toLowerCase();
            return item.title.toLowerCase().includes(s) || item.description.toLowerCase().includes(s);
        }
        return true;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
                    <p className="text-gray-400 text-sm mt-1">Report lost items or post things you've found in the society</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
                    <Plus size={15} /> Post Item
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={filters.search}
                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                        className="form-input pl-10"
                    />
                </div>
                <select value={filters.type} onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))} className="form-input sm:w-36">
                    <option value="">All Types</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                </select>
                <select value={filters.category} onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))} className="form-input sm:w-40">
                    <option value="">All Categories</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Posted', val: items.length, color: 'text-white' },
                    { label: 'Lost Items', val: items.filter(i => i.type === 'lost').length, color: 'text-red-400' },
                    { label: 'Found Items', val: items.filter(i => i.type === 'found').length, color: 'text-green-400' },
                ].map((s, i) => (
                    <div key={i} className="card p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                        <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Items Grid */}
            {isLoading ? (
                <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                        <div
                            key={item._id}
                            onClick={() => setSelectedItem(item)}
                            className="card p-5 cursor-pointer hover:bg-gray-700/30 transition-all hover:border-gray-600"
                        >
                            {/* Photo */}
                            {item.photos?.length > 0 && (
                                <img
                                    src={item.photos[0].url}
                                    alt={item.title}
                                    className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-700"
                                />
                            )}

                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <span className={`badge text-xs capitalize ${typeBadge(item.type)}`}>{item.type}</span>
                                    {item.status === 'resolved' && <span className={`badge text-xs ${statusBadge('resolved')}`}>Resolved</span>}
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Tag size={11} />{item.category}</span>
                                {item.location && <span className="flex items-center gap-1"><MapPin size={11} />{item.location}</span>}
                                <span className="flex items-center gap-1"><Clock size={11} />{formatDate(item.createdAt)}</span>
                                <span className="flex items-center gap-1"><Eye size={11} />{item.viewCount} views</span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Posted by <span className="text-gray-300">{item.reporter?.name}</span>
                                    {item.reporter?.apartmentNumber && ` · Apt ${item.reporter.apartmentNumber}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card py-16 text-center">
                    <Package className="mx-auto h-10 w-10 text-gray-600 mb-3" />
                    <p className="text-gray-400 font-medium">No items found</p>
                    <p className="text-gray-600 text-sm mt-1">
                        {filters.search || filters.type || filters.category ? 'Try adjusting your filters.' : 'No lost or found items posted yet.'}
                    </p>
                </div>
            )}

            {/* Post Item Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="card w-full max-w-lg p-6 space-y-4 my-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Post Lost / Found Item</h2>
                            <button onClick={resetForm} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type toggle */}
                            <div className="grid grid-cols-2 gap-2">
                                {typeOptions.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: t }))}
                                        className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                                            form.type === t
                                                ? t === 'lost' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-green-500/20 text-green-400 border border-green-500/40'
                                                : 'bg-gray-800 text-gray-500 border border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        {t === 'lost' ? '😟 I Lost Something' : '🎉 I Found Something'}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="form-label">Title *</label>
                                <input type="text" className="form-input" placeholder="e.g. Black iPhone 14, Blue Umbrella" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                                {formErrors.title && <p className="mt-1 text-xs text-red-400">{formErrors.title}</p>}
                            </div>

                            <div>
                                <label className="form-label flex items-center gap-2">
                                    Description *
                                    {analyzing && <span className="flex items-center gap-1 text-xs text-blue-400"><Sparkles size={11} className="animate-pulse" />Analyzing...</span>}
                                </label>
                                <textarea
                                    rows={3}
                                    className="form-input resize-none"
                                    placeholder="Describe the item in detail — color, brand, size, any identifying marks..."
                                    value={form.description}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                />
                                {formErrors.description && <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>}
                                <p className="text-xs text-gray-600 mt-1">💡 Category will be auto-detected from your description</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label flex items-center gap-1"><MapPin size={12} />Location</label>
                                    <input type="text" className="form-input" placeholder="e.g. Near lobby, Floor 3" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label flex items-center gap-1"><Phone size={12} />Contact Info</label>
                                    <input type="text" className="form-input" placeholder="Phone or flat number" value={form.contactInfo} onChange={(e) => setForm(f => ({ ...f, contactInfo: e.target.value }))} />
                                </div>
                            </div>

                            {/* Photo upload */}
                            <div>
                                <label className="form-label">Photos <span className="text-gray-600">(Optional, max 3)</span></label>
                                <div
                                    className="relative border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-xl p-6 text-center cursor-pointer transition-colors"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                                >
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <Upload className="mx-auto h-6 w-6 text-gray-600 mb-1" />
                                    <p className="text-xs text-gray-500"><span className="text-blue-400">Click to upload</span> or drag & drop</p>
                                </div>
                                {photos.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {photos.map((p, i) => (
                                            <div key={i} className="relative group aspect-square">
                                                <img src={URL.createObjectURL(p)} alt="" className="w-full h-full object-cover rounded-lg border border-gray-700" />
                                                <button type="button" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-gray-900/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={resetForm} className="btn btn-outline flex-1">Cancel</button>
                                <button type="submit" disabled={createMutation.isLoading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                                    {createMutation.isLoading ? <><LoadingSpinner size="sm" />Posting...</> : 'Post Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="card w-full max-w-lg p-6 space-y-4 my-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className={`badge text-xs capitalize ${typeBadge(selectedItem.type)}`}>{selectedItem.type}</span>
                                    <span className={`badge text-xs ${statusBadge(selectedItem.status)}`}>{selectedItem.status}</span>
                                </div>
                                <h2 className="text-lg font-bold text-white">{selectedItem.title}</h2>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
                                <X size={16} />
                            </button>
                        </div>

                        {selectedItem.photos?.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {selectedItem.photos.map((p, i) => (
                                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer">
                                        <img src={p.url} alt="" className="w-full aspect-square object-cover rounded-lg border border-gray-700 hover:border-gray-500 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <p className="text-sm text-gray-300 leading-relaxed">{selectedItem.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                                <p className="text-gray-500 mb-1">Category</p>
                                <p className="text-white font-medium">{selectedItem.category}</p>
                            </div>
                            {selectedItem.location && (
                                <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                                    <p className="text-gray-500 mb-1">Location</p>
                                    <p className="text-white font-medium">{selectedItem.location}</p>
                                </div>
                            )}
                            <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                                <p className="text-gray-500 mb-1">Posted by</p>
                                <p className="text-white font-medium">{selectedItem.reporter?.name}</p>
                                {selectedItem.reporter?.apartmentNumber && <p className="text-gray-500">Apt {selectedItem.reporter.apartmentNumber}</p>}
                            </div>
                            {selectedItem.contactInfo && (
                                <div className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/50">
                                    <p className="text-gray-500 mb-1">Contact</p>
                                    <p className="text-white font-medium">{selectedItem.contactInfo}</p>
                                </div>
                            )}
                        </div>

                        {selectedItem.status === 'active' && selectedItem.reporter?._id !== user?._id && selectedItem.reporter !== user?._id && (
                            <button
                                onClick={() => claimMutation.mutate(selectedItem._id)}
                                disabled={claimMutation.isLoading}
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {claimMutation.isLoading ? <><LoadingSpinner size="sm" />Claiming...</> : <><CheckCircle size={15} />This is mine / I found the owner</>}
                            </button>
                        )}

                        {selectedItem.status === 'active' && (selectedItem.reporter?._id === user?._id || selectedItem.reporter === user?._id) && (
                            <button
                                onClick={() => markResolved.mutate(selectedItem._id)}
                                disabled={markResolved.isLoading}
                                className="btn btn-outline w-full flex items-center justify-center gap-2 text-green-400 border-green-500/30 hover:bg-green-500/10"
                            >
                                {markResolved.isLoading ? <><LoadingSpinner size="sm" />Updating...</> : <><CheckCircle size={15} />Mark as Resolved</>}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LostFound;
