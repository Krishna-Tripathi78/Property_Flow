import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Home, Phone, Eye, EyeOff, Building } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const watchRole = watch('role', 'resident');

    const onSubmit = async (data) => {
        setLoading(true);
        const result = await registerUser(data);
        if (result.success) {
            setTimeout(() => navigate('/dashboard'), 1000);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <Building className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">PropertyFlow</h1>
                    <p className="text-gray-500 text-sm mt-1">Create your account</p>
                </div>

                <div className="card p-8 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Get started</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label className="form-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                                    type="text"
                                    className="form-input pl-10"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="form-label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                                    })}
                                    type="email"
                                    className="form-input pl-10"
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input pl-10 pr-10"
                                    placeholder="Create a password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="form-label">Account Type</label>
                            <select {...register('role', { required: true })} className="form-input">
                                <option value="resident">Resident</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {watchRole === 'resident' && (
                            <div>
                                <label className="form-label">Apartment Number</label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <input
                                        {...register('apartmentNumber', { required: 'Apartment number is required' })}
                                        type="text"
                                        className="form-input pl-10"
                                        placeholder="e.g., A-101"
                                    />
                                </div>
                                {errors.apartmentNumber && <p className="mt-1.5 text-xs text-red-400">{errors.apartmentNumber.message}</p>}
                            </div>
                        )}

                        <div>
                            <label className="form-label">Phone Number <span className="text-gray-600">(Optional)</span></label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    {...register('phoneNumber')}
                                    type="tel"
                                    className="form-input pl-10"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center py-2.5 mt-2"
                        >
                            {loading ? <><LoadingSpinner size="sm" className="mr-2" />Creating account...</> : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
