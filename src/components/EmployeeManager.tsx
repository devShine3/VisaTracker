import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { UserPlus, Trash2, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmployeeManager: React.FC = () => {
    const { employees, addEmployee, deleteEmployee } = useApp();
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('Employee');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMemberName.trim()) {
            addEmployee({
                id: crypto.randomUUID(),
                name: newMemberName,
                role: newMemberRole
            });
            setNewMemberName('');
            setNewMemberRole('Employee');
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Team Members</h2>
                    <p className="text-slate-500">Manage your organization's employees</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                >
                    <UserPlus size={20} />
                    Add Employee
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddMember}
                        className="glass-panel p-6 rounded-2xl border border-indigo-100 space-y-4 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                                <input
                                    type="text"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter name"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option>Employee</option>
                                    <option>Manager</option>
                                    <option>Admin</option>
                                    <option>Developer</option>
                                    <option>Designer</option>
                                    <option>HR</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20"
                            >
                                Save Member
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {employees.map((member) => (
                        <motion.div
                            key={member.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel p-4 rounded-xl border border-white/50 hover:border-indigo-200 transition-colors group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{member.name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                            <Briefcase size={12} />
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteEmployee(member.id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove member"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
