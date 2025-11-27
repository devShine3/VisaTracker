import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { X, Plus, Trash2, Save, Smartphone, Mail, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminContact } from '../types';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { adminSettings, updateAdminSettings } = useApp();
    const [contacts, setContacts] = useState<AdminContact[]>(adminSettings.contacts);
    const [autoReminders, setAutoReminders] = useState(adminSettings.autoReminders);

    const [newContact, setNewContact] = useState<{ label: string; type: 'whatsapp' | 'email'; value: string }>({
        label: '',
        type: 'whatsapp',
        value: ''
    });

    const handleAddContact = () => {
        if (newContact.label && newContact.value) {
            setContacts([...contacts, { ...newContact, id: crypto.randomUUID() }]);
            setNewContact({ label: '', type: 'whatsapp', value: '' });
        }
    };

    const handleDeleteContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    const handleSave = () => {
        updateAdminSettings({
            ...adminSettings,
            contacts,
            autoReminders
        });
        onClose();
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
                        <h2 className="text-2xl font-bold text-slate-800">Admin Settings</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Automation Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Bell size={20} className="text-indigo-600" />
                                Automation
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div>
                                    <p className="font-medium text-slate-800">Auto-Check on Login</p>
                                    <p className="text-sm text-slate-500">Automatically open the report window if critical documents are found when you visit the dashboard.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={autoReminders}
                                        onChange={e => setAutoReminders(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        {/* Contact Management */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Smartphone size={20} className="text-indigo-600" />
                                Notification Contacts
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. My Personal Mobile"
                                        value={newContact.label}
                                        onChange={e => setNewContact({ ...newContact, label: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                                    <select
                                        value={newContact.type}
                                        onChange={e => setNewContact({ ...newContact, type: e.target.value as 'whatsapp' | 'email' })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Value</label>
                                    <input
                                        type="text"
                                        placeholder={newContact.type === 'whatsapp' ? '+1234567890' : 'admin@example.com'}
                                        value={newContact.value}
                                        onChange={e => setNewContact({ ...newContact, value: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <button
                                        onClick={handleAddContact}
                                        disabled={!newContact.label || !newContact.value}
                                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {contacts.map(contact => (
                                    <div key={contact.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${contact.type === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {contact.type === 'whatsapp' ? <Smartphone size={18} /> : <Mail size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{contact.label}</p>
                                                <p className="text-sm text-slate-500">{contact.value}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {contacts.length === 0 && (
                                    <p className="text-center text-slate-400 py-4 text-sm">No contacts added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 font-bold flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Settings
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
