'use client';

import { Heatmap } from '@/components/stats/heatmap';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, Zap, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStats } from '@/lib/actions/stats-actions';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { eachDayOfInterval, startOfYear, endOfYear, format, isToday, startOfWeek, endOfWeek, eachMonthOfInterval, parseISO } from 'date-fns';

export default function StatsPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        if (!session?.user?.id) return;
        async function load() {
            try {
                const data = await getStats(session!.user!.id!);
                setStats(data);
            } catch (e) {
                console.error("Failed to load stats", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [session]);

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] font-bold text-muted-foreground animate-pulse">
                Loading Analytics...
            </div>
        );
    }

    const currentHabitStats = selectedHabitId && stats.habitStats[selectedHabitId]
        ? stats.habitStats[selectedHabitId]
        : null;

    const heatmapData = currentHabitStats ? currentHabitStats.heatmap : stats.heatmapData;
    const currentStreak = currentHabitStats ? currentHabitStats.currentStreak : stats.currentStreak;
    const longestStreak = currentHabitStats ? currentHabitStats.longestStreak : stats.longestStreak;
    const title = currentHabitStats ? currentHabitStats.name : 'Overall Performance';
    const habitColor = currentHabitStats ? currentHabitStats.color : undefined;

    const selectedDayData = (selectedDay && stats.dailyDetails) ? stats.dailyDetails[selectedDay] : null;

    const dropdownOptions = [
        { id: null, name: 'Overall Performance' },
        ...stats.habitsList
    ];

    const STAT_CARDS = [
        { label: 'Current Streak', value: `${currentStreak} Days`, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Longest Streak', value: `${longestStreak} Days`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Active Days', value: Object.keys(heatmapData).length.toString(), icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Total Logs', value: (Object.values(heatmapData) as number[]).reduce((a: any, b: any) => a + b, 0).toString(), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-32 lg:pb-12 lg:pt-12">
            <header className="px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">Analytics</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Insights and trends for {selectedHabitId ? 'your ritual' : 'all rituals'}.</p>
                </div>

                <CustomDropdown
                    options={dropdownOptions}
                    value={selectedHabitId}
                    onChange={setSelectedHabitId}
                    label="All Rituals"
                />
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedHabitId || 'all'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-8"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
                        {STAT_CARDS.map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-card p-6 rounded-[2rem] border border-white/5 shadow-lg flex flex-col gap-4 hover:bg-white/5 transition-colors"
                            >
                                <div className={cn("inline-flex p-3 rounded-2xl w-fit", stat.bg)}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                                    <p className="text-3xl font-black mt-1 text-white">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="px-6">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={habitColor ? { backgroundColor: habitColor } : {}} />
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title} Heatmap</h2>
                        </div>
                        <div className="bg-card p-1 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                            <Heatmap
                                data={heatmapData}
                                color={habitColor}
                                onDayClick={(date: Date) => setSelectedDay(format(date, 'yyyy-MM-dd'))}
                                selectedDay={selectedDay}
                            />
                        </div>

                        <AnimatePresence>
                            {selectedDay && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-8 overflow-hidden"
                                >
                                    <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight">{format(parseISO(selectedDay), 'MMMM do, yyyy')}</h3>
                                                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">{format(parseISO(selectedDay), 'EEEE')}</p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedDay(null)}
                                                className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedDayData && selectedDayData.length > 0 ? (
                                                selectedDayData.map((habit: any) => (
                                                    <div key={habit.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: habit.color, boxShadow: `0 0 10px ${habit.color}` }} />
                                                        <span className="font-bold flex-1">{habit.name}</span>
                                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                            Completed
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-muted-foreground font-medium italic">
                                                    No rituals logged on this day.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </motion.div>
            </AnimatePresence>

            {/* Archetype Hero Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-6"
            >
                <div className={cn(
                    "relative overflow-hidden p-8 rounded-[3rem] border border-white/10 shadow-2xl bg-gradient-to-br",
                    stats.archetype.gradient
                )}>
                    {/* Background Decorative Element */}
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/5 blur-[80px] rounded-full rotate-12 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-shrink-0 w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-5xl shadow-inner group">
                            <span className="transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{stats.archetype.icon}</span>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black text-white tracking-tighter">
                                    {stats.archetype.name}
                                </h2>
                                <span className="w-fit mx-auto md:mx-0 px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/10">
                                    Current Archetype
                                </span>
                            </div>
                            <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                {stats.archetype.description}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="text-center md:text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Ritual Authority</p>
                                <div className="flex items-center gap-1 justify-center md:justify-end text-2xl font-black text-white">
                                    {Math.floor(Object.keys(stats.heatmapData).length / 5) + 1}
                                    <span className="text-xs text-muted-foreground">Lvl</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <section className="px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] flex flex-col gap-4 shadow-xl">
                    <h3 className="font-bold text-xl text-white flex items-center gap-2">
                        <Zap size={20} className="text-primary fill-primary/20" />
                        AI Strategy
                    </h3>
                    <p className="text-sm leading-relaxed text-blue-100/70">
                        {selectedHabitId
                            ? `For "${currentHabitStats?.name}", you are most consistent when logging before 9 AM. Keep this early-bird momentum to strengthen your streak.`
                            : `Consistency peak detected! You've logged multiple habits. Your streaks are 15% better on weekends—try setting higher targets then!`
                        }
                    </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col gap-4 shadow-xl">
                    <h3 className="font-bold text-xl text-white">Milestones</h3>
                    <div className="flex flex-wrap gap-2">
                        {['First Week', 'Double-Digits', 'Firestarter', 'Committed'].map(m => (
                            <span key={m} className="px-4 py-2 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-white/5">
                                {m}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
