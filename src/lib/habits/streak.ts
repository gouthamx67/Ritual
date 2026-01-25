import { differenceInDays, parseISO, format, addDays, subDays, startOfDay } from 'date-fns';

export interface HabitLogEntry {
    date: string; // YYYY-MM-DD
    completed: boolean;
}

export function calculateStreak(logs: HabitLogEntry[], userTimezone: string = 'UTC') {
    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort logs by date descending
    const sortedLogs = [...logs]
        .filter(log => log.completed)
        .sort((a, b) => b.date.localeCompare(a.date));

    if (sortedLogs.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get current date in user's timezone (YYYY-MM-DD)
    // Note: In a real app, we'd use a library like date-fns-tz or handle the offset
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak
    const lastLogDate = sortedLogs[0].date;

    // A streak is active if the last completion was today or yesterday
    if (lastLogDate === today || lastLogDate === yesterday) {
        let checkDate = lastLogDate;
        let logIndex = 0;

        while (logIndex < sortedLogs.length) {
            if (sortedLogs[logIndex].date === checkDate) {
                currentStreak++;
                checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
                logIndex++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    let currentMax = 0;
    if (sortedLogs.length > 0) {
        let streakCount = 1;
        for (let i = 1; i < sortedLogs.length; i++) {
            const prevDate = parseISO(sortedLogs[i - 1].date);
            const currDate = parseISO(sortedLogs[i].date);

            const diff = differenceInDays(prevDate, currDate);

            if (diff === 1) {
                streakCount++;
            } else {
                currentMax = Math.max(currentMax, streakCount);
                streakCount = 1;
            }
        }
        longestStreak = Math.max(currentMax, streakCount);
    }

    return { currentStreak, longestStreak };
}
