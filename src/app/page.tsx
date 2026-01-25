'use client';

import { format } from 'date-fns';
import { HabitCard } from '@/components/habits/habit-card';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getHabits, logHabit, deleteHabit } from '@/lib/actions/habit-actions';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import confetti from 'canvas-confetti';

const MOTIVATIONAL_QUOTES = [
  "Small steps every day lead to big results.",
  "Discipline is choosing between what you want now and what you want most.",
  "Don't break the chain! You've got this.",
  "Your future self will thank you for today's effort.",
  "Consistency is the playground of excellence.",
  "One habit at a time, you are redefining yourself.",
  "Success is the sum of small effort, repeated day in and day out."
];

export default function TodayPage() {
  const { data: session, status } = useSession();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const confettiFired = useRef(false);

  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const data = await getHabits(session.user.id);
      const processed = data.map((h: any) => ({
        ...h,
        completedToday: h.logs.some((l: any) => l.date === dateStr && l.completed)
      }));
      setHabits(processed);
    } catch (e) {
      console.error("Failed to load habits", e);
    } finally {
      setLoading(false);
    }
  }, [session, dateStr]);

  useEffect(() => {
    if (session?.user?.id) {
      load();
      window.addEventListener('habits-updated', load);
      return () => window.removeEventListener('habits-updated', load);
    }
  }, [session, load]);

  const completionPercentage = habits.length > 0
    ? Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100)
    : 0;

  useEffect(() => {
    if (completionPercentage === 100 && habits.length > 0 && !confettiFired.current) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      });
      confettiFired.current = true;
    } else if (completionPercentage < 100) {
      confettiFired.current = false;
    }
  }, [completionPercentage, habits.length]);

  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    if (!session?.user?.id) return;

    // Optimistic Update
    setHabits(prev => prev.map((h: any) =>
      h.id === habitId ? {
        ...h,
        completedToday: !currentStatus,
        currentStreak: !currentStatus ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1)
      } : h
    ));

    try {
      await logHabit(habitId, dateStr, !currentStatus);
    } catch (e) {
      console.error("Failed to sync log", e);
      load(); // Reload on error
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (e) {
      console.error("Failed to delete habit", e);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-32 lg:pb-12 lg:pt-12">
      <header className="px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mb-1 text-primary">
              {format(today, 'EEEE, MMMM do')}
            </p>
            <h1 className="text-5xl font-black tracking-tighter">Today</h1>
            {completionPercentage < 100 && habits.length > 0 && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-muted-foreground mt-2 text-sm font-medium italic"
              >
                "{quote}"
              </motion.p>
            )}
            {completionPercentage === 100 && habits.length > 0 && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-primary mt-2 text-sm font-black uppercase tracking-widest"
              >
                🎉 Mastered for Today!
              </motion.p>
            )}
          </div>
          <div className="flex items-end gap-6 bg-card/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="text-right">
              <span className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{completionPercentage}%</span>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Goal</p>
            </div>
            <div className="w-32 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5 self-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 flex flex-col gap-8">
        <AnimatePresence mode="popLayout">
          {habits.length === 0 && (
            <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
              <p className="text-muted-foreground font-medium mb-1 text-lg">Create your first ritual</p>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">Use the sidebar or bottom button to start</p>
            </div>
          )}

          {habits.filter(h => !h.completedToday).length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-2">
                Rituals Remaining
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.filter(h => !h.completedToday).map((habit) => (
                  <HabitCard
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    streak={habit.currentStreak}
                    completedToday={false}
                    color={habit.color}
                    onToggle={() => toggleHabit(habit.id, false)}
                    onDelete={() => handleDelete(habit.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {habits.filter(h => h.completedToday).length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-2">
                Mastered Today
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.filter(h => h.completedToday).map((habit) => (
                  <HabitCard
                    key={habit.id}
                    id={habit.id}
                    name={habit.name}
                    streak={habit.currentStreak}
                    completedToday={true}
                    color={habit.color}
                    onToggle={() => toggleHabit(habit.id, true)}
                    onDelete={() => handleDelete(habit.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
