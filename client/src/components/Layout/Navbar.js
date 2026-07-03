import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Home, FileText, Bell, Settings, LogOut, Shield, Building } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/complaints', label: 'My Complaints', icon: FileText },
        { path: '/notices', label: 'Notices', icon: Bell },
    ];

    const adminLinks = [
        { path: '/admin', label: 'Admin Dashboard', icon: Shield },
        { path: '/admin/complaints', label: 'All Complaints', icon: FileText },
        { path: '/admin/notices', label: 'Manage Notices', icon: Bell },
        { path: '/admin/users', label: 'User Management', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/dashboard" className="flex items-center space-x-2">
                        <div className="h-7 w-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">PropertyFlow</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(path)
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <Icon size={15} />
                                <span>{label}</span>
                            </Link>
                        ))}

                        {user?.role === 'admin' && (
                            <>
                                <div className="h-5 border-l border-gray-700 mx-2" />
                                {adminLinks.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive(path)
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <Icon size={15} />
                                        <span>{label}</span>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-3">
                        <span className="text-sm text-gray-400">
                            <span className="text-white font-medium">{user?.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <LogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-3 space-y-1 border-t border-gray-800">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(path)
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <Icon size={15} />
                                <span>{label}</span>
                            </Link>
                        ))}

                        {user?.role === 'admin' && (
                            <>
                                <div className="border-t border-gray-800 my-2" />
                                <p className="text-xs font-medium text-gray-600 px-3 py-1 uppercase tracking-wider">Admin</p>
                                {adminLinks.map(({ path, label, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive(path)
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <Icon size={15} />
                                        <span>{label}</span>
                                    </Link>
                                ))}
                            </>
                        )}

                        <div className="border-t border-gray-800 my-2" />
                        <button
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <LogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
