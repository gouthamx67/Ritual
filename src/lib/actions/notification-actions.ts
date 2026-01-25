'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getNotifications(userId: string) {
    if (!(prisma as any).notification) {
        console.warn("Prisma notification model not found in client. Please run 'npx prisma generate'");
        return [];
    }
    return await (prisma as any).notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export async function markAsRead(notificationId: string) {
    if (!(prisma as any).notification) return;
    await (prisma as any).notification.update({
        where: { id: notificationId },
        data: { read: true }
    });
    revalidatePath('/');
}

// AI Engine to generate suggestions based on user habits
export async function generateDisciplineAI(userId: string) {
    if (!(prisma as any).notification) return;

    const habits = await prisma.habit.findMany({
        where: { userId, archived: false },
        include: {
            logs: {
                orderBy: { date: 'desc' },
                take: 14
            }
        }
    });

    if (habits.length === 0) return;

    const suggestions = [];

    for (const habit of habits) {
        const recentLogs = habit.logs;
        const completionRate = recentLogs.filter((l: any) => l.completed).length / 14;

        // Insight 1: Low consistency
        if (completionRate < 0.5 && completionRate > 0) {
            suggestions.push({
                type: 'SUGGESTION',
                title: `Boost: ${habit.name}`,
                message: `You've missed ${habit.name} a few times lately. Try moving it to 5 minutes earlier to build momentum!`
            });
        }

        // Insight 2: High consistency peak
        if (completionRate > 0.8) {
            suggestions.push({
                type: 'MILESTONE',
                title: `Unstoppable at ${habit.name}`,
                message: `80%+ completion rate! You're mastering this ritual. Ever thought about increasing the difficulty?`
            });
        }

        // Insight 3: Weekend dip (simplified detection)
        const weekendMisses = recentLogs.filter((l: any) => {
            const day = new Date(l.date).getDay();
            return (day === 0 || day === 6) && !l.completed;
        }).length;

        if (weekendMisses > 1) {
            suggestions.push({
                type: 'SUGGESTION',
                title: 'Weekend Maintenance',
                message: `Consistency dips on weekends for ${habit.name}. Focus on an "Easy Mode" version on Sat/Sun to keep the fire alive.`
            });
        }
    }

    // Pick the most relevant one and save it as a notification (if not already sent recently)
    if (suggestions.length > 0) {
        const bestSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

        // Check if we sent this exact suggestion in the last 3 days
        const recent = await (prisma as any).notification.findFirst({
            where: {
                userId,
                title: bestSuggestion.title,
                createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
            }
        });

        if (!recent) {
            await (prisma as any).notification.create({
                data: {
                    userId,
                    ...bestSuggestion
                }
            });
            revalidatePath('/');
        }
    }
}
