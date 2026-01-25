'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getHabits } from '@/lib/actions/habit-actions';
import { format } from 'date-fns';

export function ReminderManager() {
    const { data: session } = useSession();
    const [remindedToday, setRemindedToday] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!session?.user?.id) return;

        const checkReminders = async () => {
            const userId = session.user?.id;
            if (!userId) return;

            const habits = await getHabits(userId);
            const now = format(new Date(), 'HH:mm');
            const today = format(new Date(), 'yyyy-MM-dd');

            habits.forEach((habit: any) => {
                if (habit.reminderTime && habit.reminderTime === now) {
                    const reminderId = `${habit.id}-${today}`;

                    if (!remindedToday.has(reminderId)) {
                        // Check if already completed today
                        const isCompleted = habit.logs.some((log: any) => log.date === today && log.completed);

                        if (!isCompleted) {
                            sendNotification(habit.name);
                            setRemindedToday(prev => new Set(prev).add(reminderId));
                        }
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [session, remindedToday]);

    const sendNotification = (habitName: string) => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            new Notification("Ritual Reminder", {
                body: `Time for your ritual: ${habitName}`,
                icon: "/icon-192.png",
            });
        }
    };

    return null;
}
