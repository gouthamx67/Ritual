'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getStats } from '@/lib/actions/stats-actions';
import { useSession } from 'next-auth/react';

export default function CalendarPage() {
    const { data: session } = useSession();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [completionData, setCompletionData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        async function load() {
            try {
                const { heatmapData } = await getStats(session!.user!.id!);
                setCompletionData(heatmapData);
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
    const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

    return (
        <div className="flex flex-col gap-8 pb-32 lg:pb-12 lg:pt-12">
            <header className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">History</h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Reviewing <span className="text-white font-bold">{format(currentDate, 'MMMM yyyy')}</span>
                    </p>
                </div>
                <div className="flex bg-card/50 backdrop-blur-md p-2 rounded-2xl border border-white/5 shadow-xl">
                    <button onClick={prevMonth} className="p-3 rounded-xl hover:bg-white/5 active:scale-90 transition-all text-muted-foreground hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="px-6 flex items-center justify-center min-w-[140px] font-bold tracking-tight">
                        {format(currentDate, 'MMM yyyy').toUpperCase()}
                    </div>
                    <button onClick={nextMonth} className="p-3 rounded-xl hover:bg-white/5 active:scale-90 transition-all text-muted-foreground hover:text-white">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </header>

            <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-[3rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 bg-card/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                            </div>
                        )}

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] py-4">
                                    {day}
                                </div>
                            ))}
                            {days.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const hasCompletion = completionData[dateKey] > 0 && isCurrentMonth;

                                return (
                                    <motion.div
                                        key={day.toString()}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.005 }}
                                        className={cn(
                                            "relative aspect-square flex items-center justify-center rounded-2xl transition-all cursor-pointer group",
                                            !isCurrentMonth && "opacity-10 pointer-events-none",
                                            isTodayDate && "bg-white/10 ring-1 ring-white/20 shadow-lg",
                                            hasCompletion ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-white/5"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-lg font-bold transition-all group-hover:scale-110",
                                            hasCompletion ? "text-primary scale-110" : "text-white/60 group-hover:text-white"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {hasCompletion && (
                                            <motion.div
                                                layoutId={`dot-${dateKey}`}
                                                className="absolute bottom-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <History size={24} />
                            </div>
                            <h3 className="font-black text-xl tracking-tight">Activity Log</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Total Logs</p>
                                <p className="text-3xl font-black text-white">{Object.values(completionData).reduce((a, b) => a + b, 0)}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10">
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Best Month</p>
                                <p className="text-3xl font-black text-white">{format(currentDate, 'MMMM')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[2.5rem]">
                        <h4 className="font-bold text-sm text-indigo-400 uppercase tracking-widest mb-2">Memory</h4>
                        <p className="text-sm text-indigo-100/60 leading-relaxed italic">
                            "Every day is a fresh start. Every blue dot is progress."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
