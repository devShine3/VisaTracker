import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppProvider';
import { getDaysRemaining, getExpiryStatus, formatDate, getStatusColor } from '../utils/dateUtils';
import { AlertTriangle, CheckCircle, Clock, FileText, Settings, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { SettingsModal } from './SettingsModal';
import { ReportModal } from './ReportModal';

interface DashboardProps {
    onNavigate: (tab: string, filter?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const { documents, adminSettings } = useApp();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const stats = documents.reduce((acc, doc) => {
        const days = getDaysRemaining(doc.expiryDate);
        const status = getExpiryStatus(days);

        acc.total++;
        if (status === 'critical') acc.critical++;
        if (status === 'warning') acc.warning++;
        if (status === 'good') acc.good++;
        if (status === 'expired') acc.expired++;
        return acc;
    }, { total: 0, critical: 0, warning: 0, good: 0, expired: 0 });

    const expiringDocs = documents
        .filter(doc => {
            const days = getDaysRemaining(doc.expiryDate);
            return days <= 90;
        })
        .sort((a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate));

    // Auto-Check Logic
    useEffect(() => {
        if (adminSettings.autoReminders) {
            const today = new Date().toISOString().split('T')[0];
            const hasAlerts = stats.critical > 0 || stats.warning > 0 || stats.expired > 0;

            if (hasAlerts && adminSettings.lastReminderDate !== today) {
                // Small delay to ensure smooth loading
                const timer = setTimeout(() => setIsReportOpen(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [adminSettings, stats]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
                    <p className="text-slate-500 mt-2 text-lg">Overview of your team's document status</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsReportOpen(true)}
                        className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                    >
                        <Send size={20} />
                        Send Admin Report
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2.5 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl border border-slate-200 transition-colors shadow-sm"
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Documents"
                    value={stats.total}
                    icon={<FileText size={24} />}
                    color="indigo"
                    delay={0}
                    onClick={() => onNavigate('documents', 'all')}
                />
                <StatsCard
                    title="Critical (< 30 days)"
                    value={stats.critical + stats.expired}
                    icon={<AlertTriangle size={24} />}
                    color="rose"
                    delay={0.1}
                    onClick={() => onNavigate('documents', 'critical')}
                />
                <StatsCard
                    title="Warning (< 90 days)"
                    value={stats.warning}
                    icon={<Clock size={24} />}
                    color="amber"
                    delay={0.2}
                    onClick={() => onNavigate('documents', 'warning')}
                />
                <StatsCard
                    title="Good Status"
                    value={stats.good}
                    icon={<CheckCircle size={24} />}
                    color="emerald"
                    delay={0.3}
                    onClick={() => onNavigate('documents', 'good')}
                />
            </div>

            {/* Expiring Soon List */}
            <motion.div variants={item} className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100/50">
                    <h3 className="text-xl font-bold text-slate-800">Expiring Soon</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Days Left</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {expiringDocs.length > 0 ? (
                                expiringDocs.map((doc) => {
                                    const days = getDaysRemaining(doc.expiryDate);
                                    const status = getExpiryStatus(days);
                                    return (
                                        <tr key={doc.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{doc.name}</div>
                                                <div className="text-sm text-slate-500">{doc.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                                                {formatDate(doc.expiryDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                                {days} days
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(status)}`}>
                                                    {status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckCircle size={48} className="text-emerald-200 mb-4" />
                                            <p className="text-lg font-medium">All good!</p>
                                            <p className="text-sm">No documents expiring soon.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
            {isReportOpen && <ReportModal onClose={() => setIsReportOpen(false)} />}
        </motion.div>
    );
};

const StatsCard = ({ title, value, icon, color, delay, onClick }: { title: string, value: number, icon: React.ReactNode, color: string, delay: number, onClick?: () => void }) => {
    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600',
        rose: 'bg-rose-50 text-rose-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    const textColors: Record<string, string> = {
        indigo: 'text-indigo-900',
        rose: 'text-rose-900',
        amber: 'text-amber-900',
        emerald: 'text-emerald-900',
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                    opacity: 1,
                    y: 0,
                    transition: { delay }
                }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 ${textColors[color]}`}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className={`text-4xl font-bold mt-2 ${textColors[color]}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-sm`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};
