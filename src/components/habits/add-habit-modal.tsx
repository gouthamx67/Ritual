'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { createHabit } from '@/lib/actions/habit-actions';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981'];

export function AddHabitModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [reminderTime, setReminderTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (!session?.user?.id) {
            alert("Session error: Please try logging out and back in. (User ID not found)");
            return;
        }

        setIsSubmitting(true);
        try {
            const newHabit = await createHabit({
                userId: session.user.id,
                name,
                color,
                frequency: 'DAILY',
                goalType: 'BINARY',
                reminderTime: reminderTime || undefined,
            });

            if (newHabit) {
                setName('');
                setReminderTime('');
                window.dispatchEvent(new Event('habits-updated'));
                onClose();
            } else {
                throw new Error("Habit creation failed on server.");
            }
        } catch (error: any) {
            console.error('Failed to create habit', error);
            alert(`Failed to create habit: ${error.message || 'Unknown server error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="relative w-full max-w-sm bg-card rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold tracking-tight text-white">New Ritual</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                                    Name
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Morning Yoga"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                                        Color
                                    </label>
                                    <div className="flex justify-between mt-3 px-1">
                                        {COLORS.slice(0, 4).map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setColor(c)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 transition-all",
                                                    color === c ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                                        Reminder
                                    </label>
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="w-full mt-2 bg-white/5 border border-white/10 rounded-xl p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isSubmitting || !name.trim()}
                                type="submit"
                                className="mt-4 w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                                    />
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Create Habit
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
