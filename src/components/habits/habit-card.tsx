'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trophy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HabitCardProps {
    id: string;
    name: string;
    streak: number;
    completedToday: boolean;
    onToggle: (completed: boolean) => void;
    onDelete?: () => void;
    color?: string;
}

export function HabitCard({ name, streak, completedToday, onToggle, onDelete, color = '#3b82f6' }: HabitCardProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggle = () => {
        onToggle(!completedToday);
        if (!completedToday) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="habit-card group bg-card p-4 rounded-3xl border border-white/5 shadow-xl"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleToggle}
                        className={cn(
                            "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                            completedToday
                                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {completedToday ? (
                                <motion.div
                                    key="checked"
                                    initial={{ scale: 0.5, rotate: -45 }}
                                    animate={{ scale: 1.5, rotate: 0 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                >
                                    <Check size={20} strokeWidth={3} />
                                </motion.div>
                            ) : (
                                <div key="unchecked" className="w-4 h-4 rounded-md border-2 border-white/20" />
                            )}
                        </AnimatePresence>
                    </button>

                    <div>
                        <h3 className={cn(
                            "font-semibold text-lg transition-all duration-300",
                            completedToday ? "text-muted-foreground line-through opacity-60" : "text-white"
                        )}>
                            {name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Flame size={14} className={streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"} />
                            <span className="text-xs font-bold text-muted-foreground tracking-tight">
                                {streak} DAY STREAK
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {streak >= 7 && (
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                            <Trophy size={20} />
                        </div>
                    )}

                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this ritual?')) {
                                    onDelete();
                                }
                            }}
                            className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Spark */}
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: completedToday ? '100%' : '0%' }}
                    className="h-full bg-primary"
                    style={{ backgroundColor: color }}
                />
            </div>

            {/* Completion Effect */}
            <AnimatePresence>
                {isAnimating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                        <div className="w-full h-full bg-primary/10 blur-xl rounded-full" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
