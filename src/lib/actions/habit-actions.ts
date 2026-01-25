'use server';

import prisma from '@/lib/db';
import { calculateStreak } from '@/lib/habits/streak';
import { revalidatePath } from 'next/cache';

export async function getHabits(userId: string) {
    const habits = await prisma.habit.findMany({
        where: { userId, archived: false },
        include: {
            logs: {
                orderBy: { date: 'desc' },
                take: 30, // Get last 30 days of logs for initial streak calc
            },
        },
    });
    return habits;
}

export async function createHabit(data: {
    userId: string;
    name: string;
    category?: string;
    color?: string;
    icon?: string;
    frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
    goalType: 'BINARY' | 'QUANTITATIVE';
    targetValue?: number;
    reminderTime?: string;
}) {
    console.log("Creating habit for user:", data.userId);
    try {
        const habit = await prisma.habit.create({
            data: {
                ...data,
                targetValue: data.targetValue || 1,
                reminderTime: data.reminderTime || null,
            },
        });
        console.log("Habit created successfully:", habit.id);
        revalidatePath('/');
        return habit;
    } catch (error) {
        console.error("Prisma Create Error:", error);
        throw error;
    }
}

export async function logHabit(
    habitId: string,
    date: string, // YYYY-MM-DD
    completed: boolean,
    currentValue?: number
) {
    const log = await prisma.habitLog.upsert({
        where: {
            habitId_date: {
                habitId,
                date,
            },
        },
        update: {
            completed,
            currentValue: currentValue || (completed ? 1 : 0),
        },
        create: {
            habitId,
            date,
            completed,
            currentValue: currentValue || (completed ? 1 : 0),
        },
    });

    // After logging, we should recalculate streaks for this habit
    // In a high-traffic app, this could be a background job, but for now we'll do it inline
    const allLogs = await prisma.habitLog.findMany({
        where: { habitId, completed: true },
        orderBy: { date: 'desc' },
    });

    const { currentStreak, longestStreak } = calculateStreak(allLogs);

    await prisma.habit.update({
        where: { id: habitId },
        data: { currentStreak, longestStreak },
    });

    revalidatePath('/');
    return log;
}

export async function deleteHabit(habitId: string) {
    await prisma.habit.delete({
        where: { id: habitId }
    });
    revalidatePath('/');
}
