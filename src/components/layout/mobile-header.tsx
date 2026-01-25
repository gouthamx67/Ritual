'use client';

import { NotificationCenter } from '@/components/layout/notification-center';
import { Flame } from 'lucide-react';

export function MobileHeader() {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Flame size={18} className="text-white fill-white/20" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">Ritual</span>
            </div>
            <NotificationCenter />
        </header>
    );
}
