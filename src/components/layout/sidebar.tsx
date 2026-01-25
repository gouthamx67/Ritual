'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Calendar, BarChart3, Settings, Plus, LogOut, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { NotificationCenter } from './notification-center';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
    { icon: CheckCircle2, label: 'Today', href: '/' },
    { icon: Calendar, label: 'History', href: '/calendar' },
    { icon: BarChart3, label: 'Analytics', href: '/stats' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar({ onAddClick }: { onAddClick: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [archetype, setArchetype] = useState<any>(null);

    useEffect(() => {
        if (!session?.user?.id) return;
        import('@/lib/actions/stats-actions').then(m => {
            m.getStats(session.user!.id!).then(data => setArchetype(data.archetype));
        });
    }, [session]);

    return (
        <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 border-r border-white/5 bg-card/30 backdrop-blur-xl p-6 z-40">
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Flame size={24} className="text-white fill-white/20" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white">Ritual</span>
                </div>
                <NotificationCenter />
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn(
                                "transition-transform group-hover:scale-110",
                                isActive ? "text-white" : "text-muted-foreground"
                            )} />
                            <span className="font-semibold">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
                {archetype && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3"
                    >
                        <span className="text-xl">{archetype.icon}</span>
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Your Archetype</p>
                            <p className="text-xs font-bold text-white truncate">{archetype.name}</p>
                        </div>
                    </motion.div>
                )}

                <button
                    onClick={onAddClick}
                    className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                    <Plus size={20} />
                    New Ritual
                </button>

                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="" className="w-full h-full rounded-full" />
                        ) : (
                            <span className="font-bold text-primary">{session?.user?.name?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{session?.user?.name || 'Guest User'}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{session?.user?.email?.split('@')[0]}</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
