'use client';

import { useSync } from '@/lib/hooks/use-sync';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SyncStatus() {
    const { isOnline, isSyncing } = useSync();

    return (
        <AnimatePresence>
            {!isOnline || isSyncing ? (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed top-20 lg:top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest backdrop-blur-md",
                        isOnline ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}
                >
                    {isSyncing ? (
                        <>
                            <RefreshCcw size={14} className="animate-spin" />
                            Syncing Changes...
                        </>
                    ) : !isOnline ? (
                        <>
                            <WifiOff size={14} />
                            Offline Mode
                        </>
                    ) : (
                        <>
                            <Wifi size={14} />
                            Online
                        </>
                    )}
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
