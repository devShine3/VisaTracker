import React, { useMemo } from 'react';
import { useApp } from '../context/AppProvider';
import { X, Send, Copy, Smartphone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDaysRemaining, getExpiryStatus } from '../utils/dateUtils';
import type { Document } from '../types';

interface ReportModalProps {
    onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ onClose }) => {
    const { documents, adminSettings, updateAdminSettings } = useApp();

    const reportData = useMemo(() => {
        const critical: Document[] = [];
        const warning: Document[] = [];

        documents.forEach(doc => {
            const days = getDaysRemaining(doc.expiryDate);
            const status = getExpiryStatus(days);
            if (status === 'critical' || status === 'expired') critical.push(doc);
            if (status === 'warning') warning.push(doc);
        });

        return { critical, warning };
    }, [documents]);

    const generateMessage = () => {
        const today = new Date().toLocaleDateString();
        let message = `⚠️ *Visa Tracker Alert - ${today}* ⚠️\n\n`;

        if (reportData.critical.length > 0) {
            message += `*CRITICAL (${reportData.critical.length})*\n`;
            reportData.critical.forEach(doc => {
                message += `- ${doc.name} (Expires: ${doc.expiryDate})\n`;
            });
            message += '\n';
        }

        if (reportData.warning.length > 0) {
            message += `*WARNING (${reportData.warning.length})*\n`;
            reportData.warning.forEach(doc => {
                message += `- ${doc.name} (Expires: ${doc.expiryDate})\n`;
            });
        }

        if (reportData.critical.length === 0 && reportData.warning.length === 0) {
            message += "✅ All documents are in good standing.";
        }

        return message;
    };

    const handleSend = (type: 'whatsapp' | 'email', value: string) => {
        const message = generateMessage();

        if (type === 'whatsapp') {
            const url = `https://wa.me/${value}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        } else {
            const subject = `Visa Tracker Alert - ${new Date().toLocaleDateString()}`;
            const url = `mailto:${value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }

        // Update last reminder date
        updateAdminSettings({
            ...adminSettings,
            lastReminderDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateMessage());
        alert('Report copied to clipboard!');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/50"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Admin Report</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Preview */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-700">Message Preview</h3>
                                <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                                    <Copy size={14} /> Copy
                                </button>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-mono whitespace-pre-wrap h-64 overflow-y-auto">
                                {generateMessage()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700">Send To</h3>

                            {/* Broadcast Buttons */}
                            {adminSettings.contacts.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <button
                                        onClick={() => {
                                            const emails = adminSettings.contacts
                                                .filter(c => c.type === 'email')
                                                .map(c => c.value)
                                                .join(',');
                                            if (emails) {
                                                const subject = `Visa Tracker Alert - ${new Date().toLocaleDateString()}`;
                                                const message = generateMessage();
                                                window.open(`mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank');
                                                updateAdminSettings({ ...adminSettings, lastReminderDate: new Date().toISOString().split('T')[0] });
                                            } else {
                                                alert('No email contacts found.');
                                            }
                                        }}
                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium border border-blue-100"
                                    >
                                        <Mail size={18} /> Email All
                                    </button>
                                    <button
                                        onClick={() => {
                                            const numbers = adminSettings.contacts.filter(c => c.type === 'whatsapp');
                                            if (numbers.length > 0) {
                                                if (confirm(`This will open ${numbers.length} WhatsApp tabs. Continue?`)) {
                                                    numbers.forEach(c => {
                                                        const message = generateMessage();
                                                        window.open(`https://wa.me/${c.value}?text=${encodeURIComponent(message)}`, '_blank');
                                                    });
                                                    updateAdminSettings({ ...adminSettings, lastReminderDate: new Date().toISOString().split('T')[0] });
                                                }
                                            } else {
                                                alert('No WhatsApp contacts found.');
                                            }
                                        }}
                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 font-medium border border-emerald-100"
                                    >
                                        <Smartphone size={18} /> WhatsApp All
                                    </button>
                                </div>
                            )}

                            <div className="space-y-3 h-52 overflow-y-auto">
                                {adminSettings.contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSend(contact.type, contact.value)}
                                        className="w-full p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${contact.type === 'whatsapp' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {contact.type === 'whatsapp' ? <Smartphone size={20} /> : <Mail size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{contact.label}</p>
                                                <p className="text-xs text-slate-500">{contact.value}</p>
                                            </div>
                                        </div>
                                        <Send size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </button>
                                ))}
                                {adminSettings.contacts.length === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>No contacts configured.</p>
                                        <p className="text-xs mt-1">Go to Settings to add contacts.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
