import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FileText, Bell, Shield, Clock, Mail, BarChart3,
    ArrowRight, Star, CheckCircle, Building2, Zap,
    Users, ChevronDown, Menu, X
} from 'lucide-react';

const LandingPage = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const features = [
        { icon: FileText, title: 'Complaint Tracking', desc: 'Submit and track maintenance requests with photos and real-time status updates.', color: 'blue' },
        { icon: Clock, title: 'Overdue Alerts', desc: 'Automatic priority-based alerts flag complaints that exceed resolution deadlines.', color: 'orange' },
        { icon: Bell, title: 'Notice Board', desc: 'Society announcements, pinned notices, and community updates all in one place.', color: 'purple' },
        { icon: Mail, title: 'Email Notifications', desc: 'Instant email updates whenever your complaint status changes.', color: 'green' },
        { icon: BarChart3, title: 'Admin Analytics', desc: 'Comprehensive dashboard with charts and trends for administrators.', color: 'pink' },
        { icon: Shield, title: 'Role-Based Access', desc: 'Separate secure interfaces for residents and administrators.', color: 'cyan' },
    ];

    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    };

    const steps = [
        { n: '01', title: 'Create an Account', desc: 'Register as a resident or admin in under a minute.' },
        { n: '02', title: 'Submit a Complaint', desc: 'Describe the issue, pick a category, and attach photos.' },
        { n: '03', title: 'Track Progress', desc: 'Get notified at every status change until it\'s resolved.' },
    ];

    const testimonials = [
        { name: 'Sarah Chen', role: 'Property Manager', content: 'PropertyFlow has completely changed how we handle maintenance. Transparency is through the roof.', rating: 5 },
        { name: 'Michael Rodriguez', role: 'Facility Director', content: 'Overdue detection alone saved us hours every week. Resolution time improved by 40%.', rating: 5 },
        { name: 'Emily Thompson', role: 'HOA President', content: 'Both residents and admins love it. Photo uploads make identifying issues so much easier.', rating: 5 },
    ];

    const faqs = [
        { q: 'Is PropertyFlow free to use?', a: 'Yes, you can get started for free. Premium plans are available for larger societies with advanced needs.' },
        { q: 'How do email notifications work?', a: 'Every time an admin updates your complaint status, you automatically receive an email with the details.' },
        { q: 'Can I upload photos with my complaint?', a: 'Absolutely. You can attach up to 5 photos (max 5MB each) to help illustrate the issue.' },
        { q: 'What roles are available?', a: 'There are two roles — Resident and Admin. Residents submit complaints; admins manage and resolve them.' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">PropertyFlow</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-7 text-sm text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how" className="hover:text-white transition-colors">How it works</a>
                        <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all">Sign in</Link>
                        <Link to="/register" className="text-sm font-medium bg-white text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all">Get started</Link>
                    </div>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {mobileOpen && (
                    <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-5 py-4 space-y-3">
                        {['#features', '#how', '#testimonials', '#faq'].map((href, i) => (
                            <a key={i} href={href} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-400 hover:text-white py-1.5 transition-colors capitalize">
                                {href.replace('#', '')}
                            </a>
                        ))}
                        <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                            <Link to="/login" className="text-sm text-center text-gray-300 border border-white/10 py-2 rounded-lg hover:bg-white/5 transition-all">Sign in</Link>
                            <Link to="/register" className="text-sm text-center font-medium bg-white text-gray-900 py-2 rounded-lg hover:bg-gray-100 transition-all">Get started</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* ── HERO ── */}
            <section className="relative pt-36 pb-28 px-5">
                {/* bg glows */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute top-20 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8">
                        <Zap size={11} className="text-yellow-400" />
                        Society maintenance, simplified
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
                        Manage your property
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                            without the chaos.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        PropertyFlow gives residents and admins a single platform to submit, track, and resolve maintenance complaints — fast.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-xl shadow-white/10">
                            Start for free <ArrowRight size={16} />
                        </Link>
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 border border-white/10 text-gray-300 font-medium px-7 py-3.5 rounded-xl hover:bg-white/5 hover:text-white transition-all">
                            Sign in
                        </Link>
                    </div>

                    {/* trust line */}
                    <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-600">
                        {['No credit card required', 'Free to get started', '99.9% uptime'].map((t, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                <CheckCircle size={11} className="text-green-500" /> {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* mock dashboard */}
                <div className="relative max-w-4xl mx-auto mt-20">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f] z-10 pointer-events-none rounded-2xl" />
                    <div className="border border-white/10 rounded-2xl bg-[#111118] overflow-hidden shadow-2xl shadow-black/60">
                        {/* window bar */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0d0d14]">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            <div className="ml-4 flex-1 bg-white/5 rounded-md h-5 max-w-xs" />
                        </div>
                        {/* mock content */}
                        <div className="p-6 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Complaints', val: '128', color: 'text-blue-400' },
                                { label: 'In Progress', val: '34', color: 'text-yellow-400' },
                                { label: 'Resolved', val: '89', color: 'text-green-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                                    <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                                </div>
                            ))}
                            <div className="col-span-3 bg-white/5 rounded-xl p-4 border border-white/5 space-y-2.5">
                                {['Elevator not working — Floor 3', 'Water leakage in B-204', 'Parking light out — Zone A'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300">{item}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-red-500/20 text-red-400' : i === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {i === 0 ? 'Open' : i === 1 ? 'In Progress' : 'Resolved'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-16 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-5 grid grid-cols-3 gap-8 text-center">
                    {[
                        { val: '500+', label: 'Properties managed' },
                        { val: '15K+', label: 'Complaints resolved' },
                        { val: '99.9%', label: 'Platform uptime' },
                    ].map((s, i) => (
                        <div key={i}>
                            <p className="text-4xl font-bold text-white">{s.val}</p>
                            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 px-5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">Features</p>
                        <h2 className="text-4xl font-bold text-white">Everything you need, nothing you don't</h2>
                        <p className="text-gray-400 mt-4 max-w-xl mx-auto">Built specifically for apartment societies and residential complexes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div key={i} className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                                    <f.icon size={18} />
                                </div>
                                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how" className="py-24 px-5 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">How it works</p>
                        <h2 className="text-4xl font-bold text-white">Up and running in minutes</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((s, i) => (
                            <div key={i} className="relative">
                                {i < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -translate-y-1/2 z-0" />
                                )}
                                <div className="relative z-10">
                                    <span className="text-5xl font-black text-white/5">{s.n}</span>
                                    <h3 className="font-semibold text-white mt-2 mb-2">{s.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" className="py-24 px-5 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-3">Reviews</p>
                        <h2 className="text-4xl font-bold text-white">Loved by property managers</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(t.rating)].map((_, j) => (
                                        <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{t.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-bold">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-24 px-5 border-t border-white/5">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">FAQ</p>
                        <h2 className="text-4xl font-bold text-white">Common questions</h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
                                >
                                    <span className="text-sm font-medium text-white">{faq.q}</span>
                                    <ChevronDown size={16} className={`text-gray-500 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-5 border-t border-white/5">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="relative bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-12 overflow-hidden">
                        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                                <Building2 size={22} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">Ready to get started?</h2>
                            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                Join hundreds of societies already using PropertyFlow to keep their communities running smoothly.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-xl shadow-white/10"
                            >
                                Create free account <ArrowRight size={16} />
                            </Link>
                            <p className="text-xs text-gray-600 mt-4">No credit card required · Free forever for small societies</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 py-8 px-5">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <Building2 size={12} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-white">PropertyFlow</span>
                    </div>
                    <p className="text-xs text-gray-600">© 2024 PropertyFlow. All rights reserved.</p>
                    <div className="flex gap-5 text-xs text-gray-600">
                        <a href="#features" className="hover:text-gray-400 transition-colors">Features</a>
                        <Link to="/login" className="hover:text-gray-400 transition-colors">Sign in</Link>
                        <Link to="/register" className="hover:text-gray-400 transition-colors">Sign up</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
