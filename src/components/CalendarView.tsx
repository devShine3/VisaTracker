import React from 'react';
import { useApp } from '../context/AppProvider';
import { getDaysRemaining, getExpiryStatus } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { motion } from 'framer-motion';

export const CalendarView: React.FC = () => {
    const { documents } = useApp();
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate padding days for start of month
    const startDay = monthStart.getDay();
    const paddingDays = Array(startDay).fill(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Calendar</h2>
                    <p className="text-slate-500 mt-2 text-lg">Track expiries by month</p>
                </div>
                <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-xl border border-slate-200">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-indigo-600 hover:shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h3 className="text-xl font-bold text-slate-800 min-w-[160px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </h3>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-white rounded-lg transition-colors text-slate-600 hover:text-indigo-600 hover:shadow-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-2xl overflow-hidden shadow-xl"
            >
                <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-white/40">
                    {paddingDays.map((_, i) => (
                        <div key={`padding-${i}`} className="min-h-[140px] border-b border-r border-slate-100/50 bg-slate-50/30" />
                    ))}

                    {daysInMonth.map(day => {
                        const dayDocs = documents.filter(doc =>
                            isSameDay(new Date(doc.expiryDate), day)
                        );

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-[140px] p-3 border-b border-r border-slate-100/50 transition-colors hover:bg-white/60 ${isToday(day) ? 'bg-indigo-50/30' : ''
                                    }`}
                            >
                                <div className={`text-sm font-medium mb-2 w-8 h-8 flex items-center justify-center rounded-full ${isToday(day)
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-700'
                                    }`}>
                                    {format(day, 'd')}
                                </div>

                                <div className="space-y-1.5">
                                    {dayDocs.map(doc => {
                                        const days = getDaysRemaining(doc.expiryDate);
                                        const status = getExpiryStatus(days);
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={doc.id}
                                                className={`text-xs p-2 rounded-lg border shadow-sm truncate cursor-pointer hover:scale-[1.02] transition-transform ${status === 'critical' || status === 'expired' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                        status === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                            'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                    }`}
                                                title={`${doc.name} (${doc.type})`}
                                            >
                                                <span className="font-semibold block truncate">{doc.name}</span>
                                                <span className="opacity-75 text-[10px] uppercase tracking-wide">{doc.type}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};
