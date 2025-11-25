import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Users, Plus, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FamilyManager: React.FC = () => {
    const { familyMembers, addFamilyMember, deleteFamilyMember } = useApp();
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('Spouse');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            addFamilyMember({
                id: crypto.randomUUID(),
                name,
                relation,
            });
            setName('');
            setRelation('Spouse');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this family member? Documents assigned to them will remain.')) {
            deleteFamilyMember(id);
        }
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Family Members</h2>
                <p className="text-slate-500 mt-2 text-lg">Manage family profiles to track their documents</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Member Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-6 rounded-2xl h-fit"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <Plus size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Add Member</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                                placeholder="Enter name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Relation</label>
                            <select
                                value={relation}
                                onChange={e => setRelation(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50"
                            >
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full btn-primary py-3 rounded-xl font-medium flex items-center justify-center gap-2 mt-2"
                        >
                            <Plus size={20} />
                            Add Member
                        </button>
                    </form>
                </motion.div>

                {/* Members List */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {familyMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6 rounded-2xl flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{member.name}</h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                            <User size={14} />
                                            <span>{member.relation}</span>
                                        </div>
                                    </div>
                                </div>

                                {member.relation !== 'Self' && (
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove member"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
