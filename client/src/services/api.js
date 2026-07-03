import axios from 'axios';

// Configure base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

// Complaint API functions
export const complaintAPI = {
    // Get all complaints with filters
    getComplaints: (params = {}) => {
        // Strip empty string params so they don't trigger backend validation errors
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        return axios.get('/complaints', { params: cleanParams });
    },

    // Get complaint by ID
    getComplaint: (id) => {
        return axios.get(`/complaints/${id}`);
    },

    // Create new complaint
    createComplaint: (formData) => {
        return axios.post('/complaints', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Update complaint status (admin only)
    updateComplaint: (id, updateData) => {
        return axios.put(`/admin/complaints/${id}`, updateData);
    }
};

// Notice API functions
export const noticeAPI = {
    // Get all notices
    getNotices: (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
        );
        return axios.get('/notices', { params: cleanParams });
    },

    // Get notice by ID
    getNotice: (id) => {
        return axios.get(`/notices/${id}`);
    },

    // Create notice (admin only)
    createNotice: (noticeData) => {
        return axios.post('/notices', noticeData);
    },

    // Update notice (admin only)
    updateNotice: (id, noticeData) => {
        return axios.put(`/notices/${id}`, noticeData);
    },

    // Delete notice (admin only)
    deleteNotice: (id) => {
        return axios.delete(`/notices/${id}`);
    }
};

// Admin API functions
export const adminAPI = {
    // Get dashboard statistics
    getDashboardStats: () => {
        return axios.get('/admin/dashboard/stats');
    },

    // Get all users
    getUsers: () => {
        return axios.get('/admin/users');
    },

    // Update user status
    updateUserStatus: (id, statusData) => {
        return axios.put(`/admin/users/${id}/status`, statusData);
    }
};

// File upload helper
export const uploadFile = (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Format error message
export const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.errors) {
        return error.response.data.errors.map(err => err.msg).join(', ');
    }
    return error.message || 'An unexpected error occurred';
};

export default {
    complaintAPI,
    noticeAPI,
    adminAPI,
    uploadFile,
    getErrorMessage
};