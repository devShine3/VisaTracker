import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { DocumentForm } from './DocumentForm';
import { getDaysRemaining, getExpiryStatus, formatDate, getStatusColor } from '../utils/dateUtils';
import { Search, Plus, Trash2, Edit2, FileText } from 'lucide-react';
import type { Document } from '../types';
import { motion } from 'framer-motion';

interface DocumentListProps {
    initialFilterStatus?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ initialFilterStatus }) => {
    const { documents, deleteDocument, employees } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState(initialFilterStatus || 'all');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | undefined>(undefined);

    // Get unique roles for filter
    const roles = Array.from(new Set(employees.map(e => e.role)));

    const filteredDocs = documents.filter(doc => {
        const member = employees.find(e => e.id === doc.memberId);
        const days = getDaysRemaining(doc.expiryDate);
        const status = getExpiryStatus(days);

        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member?.role === filterRole;

        let matchesStatus = true;
        if (filterStatus === 'critical') matchesStatus = status === 'critical' || status === 'expired';
        else if (filterStatus === 'warning') matchesStatus = status === 'warning';
        else if (filterStatus === 'good') matchesStatus = status === 'good';

        return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            deleteDocument(id);
        }
    };

    const handleEdit = (doc: Document) => {
        setEditingDoc(doc);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingDoc(undefined);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Documents</h2>
                    <p className="text-slate-500 mt-2 text-lg">Manage all your important documents</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    Add Document
                </button>
            </div>

            {/* Filters */}
            <div className="glass-panel p-4 rounded-xl flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                    >
                        <option value="all">All Status</option>
                        <option value="critical">Critical</option>
                        <option value="warning">Warning</option>
                        <option value="good">Good</option>
                    </select>

                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                    >
                        <option value="all">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as 'date' | 'name')}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocs.map(doc => {
                    const days = getDaysRemaining(doc.expiryDate);
                    const status = getExpiryStatus(days);
                    const member = employees.find(m => m.id === doc.memberId);

                    return (
                        <motion.div
                            key={doc.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 rounded-2xl group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    <FileText size={24} />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusColor(status)}`}>
                                    {status.toUpperCase()}
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{doc.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{doc.type}</p>

                            <div className="space-y-3 text-sm text-slate-600 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span>Expiry:</span>
                                    <span className="font-semibold text-slate-800">{formatDate(doc.expiryDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Days Left:</span>
                                    <span className={`font-bold ${days <= 30 ? 'text-rose-600' : 'text-slate-800'}`}>{days} days</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Owner:</span>
                                    <span className="font-medium text-indigo-600">{member?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Role:</span>
                                    <span className="font-medium text-slate-500">{member?.role || '-'}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => handleEdit(doc)}
                                    className="flex-1 py-2.5 px-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium border border-slate-200 hover:border-indigo-200"
                                >
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {isFormOpen && (
                <DocumentForm
                    initialData={editingDoc}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};
