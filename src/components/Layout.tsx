import React from 'react';
import { LayoutDashboard, FileText, Users, Calendar, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'family', label: 'Family', icon: Users },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
    ];

    return (
        <div className="min-h-screen flex text-slate-800 font-sans">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 text-indigo-600"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <motion.div
                className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 glass-panel m-4 rounded-2xl flex flex-col
          transform lg:transform-none transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
        `}
                initial={false}
            >
                <div className="p-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        VisaTracker
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide uppercase">Family Document Manager</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-600 hover:bg-white/50 hover:text-indigo-600'
                                }`}
                        >
                            <item.icon size={20} className={`mr-3 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                            <span className="font-medium">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-xl border border-indigo-100/50">
                        <p className="text-xs text-indigo-600 font-semibold mb-1">Pro Tip</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Upload photos of your documents to keep a digital backup safe.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto relative">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
