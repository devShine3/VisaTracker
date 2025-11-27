import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Calendar, FileText, User, Info, Loader2, CheckCircle, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Tesseract from 'tesseract.js';
import type { Document, DocType } from '../types';

interface DocumentFormProps {
    initialData?: Document;
    onClose: () => void;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({ initialData, onClose }) => {
    const { addDocument, updateDocument, employees } = useApp();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'Passport',
        expiryDate: initialData?.expiryDate || '',
        memberId: initialData?.memberId || employees[0]?.id || '',
        photo: initialData?.photo || ''
    });

    const [scanning, setScanning] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Upload to Supabase Storage
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, photo: publicUrl }));

            // 2. Perform OCR
            setScanning(true);
            const worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setScanProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            // Simple heuristic extraction (can be improved with regex)
            let extractedDate = '';

            // Try to find a date in YYYY-MM-DD or DD/MM/YYYY format
            const dateRegex = /(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})/;
            const match = text.match(dateRegex);

            if (match) {
                const dateStr = match[0];
                // Normalize to YYYY-MM-DD for input[type="date"]
                const dateObj = new Date(dateStr);
                if (!isNaN(dateObj.getTime())) {
                    extractedDate = dateObj.toISOString().split('T')[0];
                }
            }

            if (extractedDate) {
                setFormData(prev => ({ ...prev, expiryDate: extractedDate }));
                alert(`Scanned Expiry Date: ${extractedDate}`);
            } else {
                alert('Could not automatically detect expiry date. Please enter manually.');
            }

        } catch (error: any) {
            console.error('Error:', error);
            alert('Error uploading or scanning document: ' + error.message);
        } finally {
            setUploading(false);
            setScanning(false);
            setScanProgress(0);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            updateDocument({
                ...initialData,
                ...formData
            });
        } else {
            addDocument({
                id: crypto.randomUUID(),
                ...formData,
                notes: ''
            });
        }
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
                    className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {initialData ? 'Edit Document' : 'Add Document'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Pro Tip Alert */}
                        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4">
                            <div className="flex gap-3 mb-3">
                                <Info className="text-indigo-600 shrink-0" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-indigo-900">Pro Tip</p>
                                    <p className="text-xs text-indigo-700 mt-1">
                                        Upload a photo to automatically scan details and keep a backup.
                                    </p>
                                </div>
                            </div>

                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading || scanning}
                                />
                                <div className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 transition-colors ${formData.photo ? 'border-emerald-300 bg-emerald-50/50' : 'border-indigo-200 bg-white/50 group-hover:bg-white/80'
                                    }`}>
                                    {scanning ? (
                                        <>
                                            <Loader2 className="animate-spin text-indigo-600" size={20} />
                                            <span className="text-sm font-medium text-indigo-700">Scanning... {scanProgress}%</span>
                                        </>
                                    ) : formData.photo ? (
                                        <>
                                            <CheckCircle className="text-emerald-500" size={20} />
                                            <span className="text-sm font-medium text-emerald-700">Photo Uploaded & Scanned</span>
                                        </>
                                    ) : (
                                        <>
                                            <Scan className="text-indigo-500" size={20} />
                                            <span className="text-sm font-medium text-indigo-600">Tap to Scan Document</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Name</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                                        placeholder="e.g., John's Passport"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Document Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                                >
                                    <option>Passport</option>
                                    <option>Visa</option>
                                    <option>Driving License</option>
                                    <option>Insurance</option>
                                    <option>ID Card</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <select
                                        value={formData.memberId}
                                        onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                                    >
                                        {employees.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={uploading || scanning}
                                className="w-full btn-primary py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                <Upload size={20} />
                                {initialData ? 'Update Document' : 'Save Document'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
