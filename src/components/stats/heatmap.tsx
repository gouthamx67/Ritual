'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { eachDayOfInterval, startOfYear, endOfYear, format, isToday, startOfWeek, endOfWeek, eachMonthOfInterval, isSameMonth } from 'date-fns';

interface HeatmapProps {
    data: Record<string, number>; // YYYY-MM-DD -> completion count or binary
    color?: string; // Optional primary color for the heatmap
    onDayClick?: (date: Date) => void;
    selectedDay?: string | null;
}

export function Heatmap({ data, color, onDayClick, selectedDay }: HeatmapProps) {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfWeek(endOfYear(new Date())); // Ensure we get full weeks
    const calendarStart = startOfWeek(yearStart);

    const days = eachDayOfInterval({
        start: calendarStart,
        end: yearEnd,
    });

    const months = eachMonthOfInterval({
        start: yearStart,
        end: yearEnd
    });

    const getIntensityStyle = (intensity: number) => {
        if (!color) return {};
        const opacity = intensity === 1 ? '40' : intensity === 2 ? '70' : 'ff';
        return { backgroundColor: `${color}${opacity}` };
    };

    // Weekday labels (GitHub style usually shows Mon, Wed, Fri)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-10">
                <h3 className="font-black text-xl tracking-tight">Ritual Consistency</h3>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" style={color ? { backgroundColor: color } : {}} />
                    {format(new Date(), 'yyyy')} Activity
                </div>
            </div>

            <div className="flex gap-4">
                {/* Weekday Labels */}
                <div className="grid grid-rows-7 gap-1.5 pt-8 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter w-8">
                    {weekDays.map((day, i) => (
                        <div key={day} className="h-3 flex items-center justify-start">
                            {i % 2 !== 0 ? day : ''}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar pb-6">
                    {/* Month Labels Wrapper */}
                    <div className="relative flex mb-2 h-4">
                        {months.map((month, i) => {
                            // Calculate approximate offset for month labels
                            const firstDayOfMonth = eachDayOfInterval({ start: calendarStart, end: month }).length;
                            const weekOffset = Math.floor(firstDayOfMonth / 7);

                            return (
                                <div
                                    key={month.toString()}
                                    className="absolute text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                                    style={{ left: `${weekOffset * 18}px` }}
                                >
                                    {format(month, 'MMM')}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid Wrapper */}
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max">
                        {days.map((day, idx) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const value = data[dateKey] || 0;
                            const isCurrentYear = day >= yearStart && day <= yearEnd;
                            const isSelected = selectedDay === dateKey;

                            return (
                                <motion.div
                                    key={dateKey}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.001, duration: 0.2 }}
                                    onClick={() => onDayClick?.(day)}
                                    className={cn(
                                        "w-3 h-3 rounded-sm transition-all duration-300 cursor-pointer hover:ring-1 hover:ring-white/30",
                                        !isCurrentYear && "opacity-0 pointer-events-none",
                                        value === 0 && isCurrentYear && "bg-white/5",
                                        !color && value === 1 && "bg-primary/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]",
                                        !color && value === 2 && "bg-primary/70 shadow-[0_0_12px_rgba(59,130,246,0.5)]",
                                        !color && value >= 3 && "bg-primary shadow-[0_0_15px_rgba(59,130,246,0.7)]",
                                        isToday(day) && "ring-1 ring-white/50",
                                        isSelected && "ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10"
                                    )}
                                    style={color && value > 0 ? {
                                        ...getIntensityStyle(Math.min(value, 3)),
                                        boxShadow: isSelected
                                            ? `0 0 15px ${color}`
                                            : `0 0 ${value * 4}px ${color}${Math.min(value * 20, 80)}`
                                    } : {}}
                                    title={`${format(day, 'MMM do')}: ${value} activities`}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <span>Less</span>
                    <div className="flex gap-1.5 items-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/5" />
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" style={color ? getIntensityStyle(1) : {}} />
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary/70" style={color ? getIntensityStyle(2) : {}} />
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary" style={color ? getIntensityStyle(3) : {}} />
                    </div>
                    <span>More</span>
                </div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border border-white" />
                        <span>Today</span>
                    </div>
                    <span>{format(new Date(), 'yyyy')} Year View</span>
                </div>
            </div>
        </div>
    );
}

