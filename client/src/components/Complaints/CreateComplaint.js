import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { complaintAPI } from '../../services/api';
import { Upload, X, FileText, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../UI/LoadingSpinner';

const CreateComplaint = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const createComplaintMutation = useMutation(
        (data) => complaintAPI.createComplaint(data),
        {
            onSuccess: () => { toast.success('Complaint submitted!'); navigate('/complaints'); },
            onError: (error) => toast.error(error.response?.data?.message || 'Failed to submit complaint'),
        }
    );

    const categoryOptions = ['Plumbing', 'Electrical', 'Elevator', 'Security', 'Cleaning', 'Parking', 'Noise', 'Common Area', 'Water Supply', 'Other'];

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragActive(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const valid = files.filter(f => {
            if (!f.type.startsWith('image/')) { toast.error(`${f.name} is not an image`); return false; }
            if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
            return true;
        });
        const toAdd = valid.slice(0, 5 - selectedFiles.length);
        if (valid.length > toAdd.length) toast.error('Maximum 5 photos allowed');
        setSelectedFiles(prev => [...prev, ...toAdd]);
    };

    const onSubmit = (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        selectedFiles.forEach(f => formData.append('photos', f));
        createComplaintMutation.mutate(formData);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-white">Submit New Complaint</h1>
                <p className="text-gray-400 text-sm mt-1">Report a maintenance issue and track its progress</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
                <div>
                    <label className="form-label">Complaint Title *</label>
                    <input
                        {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' }, maxLength: { value: 200, message: 'Max 200 characters' } })}
                        type="text"
                        className="form-input"
                        placeholder="Brief description of the issue"
                    />
                    {errors.title && <p className="mt-1.5 text-xs text-red-400">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="form-label">Category *</label>
                    <select {...register('category', { required: 'Please select a category' })} className="form-input">
                        <option value="">Select a category</option>
                        {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="mt-1.5 text-xs text-red-400">{errors.category.message}</p>}
                </div>

                <div>
                    <label className="form-label">Description *</label>
                    <textarea
                        {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Min 10 characters' }, maxLength: { value: 1000, message: 'Max 1000 characters' } })}
                        rows={4}
                        className="form-input resize-none"
                        placeholder="Provide detailed information about the issue, including location and relevant details"
                    />
                    {errors.description && <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>}
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="form-label">Photos <span className="text-gray-600">(Optional, max 5)</span></label>
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                            dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    >
                        <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(Array.from(e.target.files))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-400"><span className="text-blue-400 font-medium">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB each</p>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-400 mb-3">Selected ({selectedFiles.length}/5)</p>
                            <div className="grid grid-cols-3 gap-3">
                                {selectedFiles.map((file, i) => (
                                    <div key={i} className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden">
                                        <img src={URL.createObjectURL(file)} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                            className="absolute top-1.5 right-1.5 bg-gray-900/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/complaints')} className="btn btn-outline flex-1 sm:flex-none">Cancel</button>
                    <button type="submit" disabled={createComplaintMutation.isLoading} className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center">
                        {createComplaintMutation.isLoading ? <><LoadingSpinner size="sm" className="mr-2" />Submitting...</> : <><FileText size={15} className="mr-2" />Submit Complaint</>}
                    </button>
                </div>
            </form>

            <div className="card p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Tips for a better complaint</h3>
                <ul className="space-y-1.5 text-xs text-gray-400">
                    {['Be specific about the location of the issue', 'Include photos to help maintenance understand the problem', 'Mention if the issue affects multiple residents', 'Describe any safety concerns or urgency'].map((tip, i) => (
                        <li key={i} className="flex items-start space-x-2">
                            <span className="text-blue-400 mt-0.5">·</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CreateComplaint;
