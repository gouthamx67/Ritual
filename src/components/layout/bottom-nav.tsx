'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Calendar, BarChart3, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { AddHabitModal } from '@/components/habits/add-habit-modal';

const NAV_ITEMS = [
    { icon: CheckCircle2, label: 'Today', href: '/' },
    { icon: Calendar, label: 'History', href: '/calendar' },
    { icon: BarChart3, label: 'Stats', href: '/stats' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function BottomNav() {
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-xl border-t border-white/5 lg:hidden">
                <div className="flex items-center justify-between relative max-w-lg mx-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 transition-colors duration-200",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute -top-1 w-8 h-1 bg-primary rounded-full"
                                        transition={{ type: 'spring', duration: 0.5 }}
                                    />
                                )}
                                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Floating Action Button for Plus */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-transform duration-200"
                    >
                        <Plus size={32} />
                    </button>
                </div>
            </nav>
            <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
