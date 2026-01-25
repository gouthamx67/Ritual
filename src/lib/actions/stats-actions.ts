'use server';

import prisma from '@/lib/db';
import { startOfYear, endOfYear, format, subDays, startOfDay } from 'date-fns';

export interface Archetype {
    name: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
}

const ARCHETYPES = {
    NOVICE: {
        name: "Ritual Novice",
        description: "You're just beginning your journey of discipline. Every great master started exactly here.",
        icon: "🌱",
        color: "#10b981",
        gradient: "from-emerald-500/20 to-emerald-500/5"
    },
    SAGE: {
        name: "Consistent Sage",
        description: "Your consistency is legendary. You rarely miss a day, moving with calm, unwavering focus.",
        icon: "🧘",
        color: "#8b5cf6",
        gradient: "from-violet-500/20 to-violet-500/5"
    },
    MOMENTUM: {
        name: "Momentum Builder",
        description: "You move like a tidal wave. Once you start a streak, you're nearly impossible to stop.",
        icon: "🌊",
        color: "#3b82f6",
        gradient: "from-blue-500/20 to-blue-500/5"
    },
    DAWN: {
        name: "Dawn Breaker",
        description: "You conquer the day before the world wakes up. Your discipline is strongest in the morning light.",
        icon: "🌅",
        color: "#f59e0b",
        gradient: "from-amber-500/20 to-amber-500/5"
    },
    NIGHT: {
        name: "Night Owl",
        description: "While others sleep, you build. You find your deepest discipline in the quiet of the night.",
        icon: "🌙",
        color: "#6366f1",
        gradient: "from-indigo-500/20 to-indigo-500/5"
    },
    MASTER: {
        name: "Disciplined Master",
        description: "A powerhouse of habit formation. You've transformed effort into an effortless part of your soul.",
        icon: "⚔️",
        color: "#ef4444",
        gradient: "from-red-500/20 to-red-500/5"
    }
};

export async function getStats(userId: string) {
    const logs = await prisma.habitLog.findMany({
        where: {
            habit: { userId },
            completed: true,
            createdAt: {
                gte: startOfYear(new Date()),
                lte: endOfYear(new Date()),
            },
        },
        include: {
            habit: true
        }
    });

    // Aggregate ALL logs by date for global heatmap
    const heatmapData: Record<string, number> = {};
    const habitStats: Record<string, any> = {};

    let earlyLogs = 0;
    let lateLogs = 0;

    logs.forEach((log: any) => {
        const dateKey = log.date;
        heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;

        // Check hour for Dawn Breaker / Night Owl
        const hour = new Date(log.createdAt).getHours();
        if (hour < 10) earlyLogs++;
        if (hour > 21) lateLogs++;

        if (!habitStats[log.habitId]) {
            habitStats[log.habitId] = {
                name: log.habit.name,
                color: log.habit.color,
                heatmap: {},
                currentStreak: log.habit.currentStreak,
                longestStreak: log.habit.longestStreak
            };
        }
        habitStats[log.habitId].heatmap[dateKey] = (habitStats[log.habitId].heatmap[dateKey] || 0) + 1;
    });

    const habits = await prisma.habit.findMany({
        where: { userId, archived: false },
    });

    const currentStreak = Math.max(...habits.map((h: any) => h.currentStreak), 0);
    const longestStreak = Math.max(...habits.map((h: any) => h.longestStreak), 0);

    // Archetype Logic
    let archetype = ARCHETYPES.NOVICE;
    const totalLogs = logs.length;

    if (totalLogs >= 15) {
        if (longestStreak >= 21) archetype = ARCHETYPES.MASTER;
        else if (currentStreak >= 10) archetype = ARCHETYPES.MOMENTUM;
        else if (earlyLogs / totalLogs > 0.6) archetype = ARCHETYPES.DAWN;
        else if (lateLogs / totalLogs > 0.6) archetype = ARCHETYPES.NIGHT;
        else if (totalLogs / Math.max(Object.keys(heatmapData).length, 1) > 2) archetype = ARCHETYPES.SAGE;
    }

    return {
        heatmapData,
        habitStats,
        currentStreak,
        longestStreak,
        totalHabits: habits.length,
        habitsList: habits.map((h: any) => ({ id: h.id, name: h.name, color: h.color })),
        archetype
    };
}
