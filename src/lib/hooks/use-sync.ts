'use client';

import { useEffect, useState } from 'react';
import { getPendingMutations, clearMutation } from '@/lib/db/indexed-db';
import { logHabit } from '@/lib/actions/habit-actions';

export function useSync() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            performSync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const performSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            const mutations = await getPendingMutations();

            for (const mutation of mutations) {
                try {
                    if (mutation.type === 'LOG_HABIT') {
                        const { habitId, date, completed, currentValue } = mutation.data;
                        await logHabit(habitId, date, completed, currentValue);
                        await clearMutation(mutation.id);
                    }
                    // Add other mutation types here (CREATE_HABIT, etc)
                } catch (error) {
                    console.error('Failed to sync mutation:', mutation, error);
                    // If it's a conflict or permanent error, we might want to skip or handle
                }
            }
        } finally {
            setIsSyncing(false);
        }
    };

    return { isOnline, isSyncing, performSync };
}
