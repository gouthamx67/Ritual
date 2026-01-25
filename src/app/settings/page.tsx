'use client';

import { motion } from 'framer-motion';
import { User, Bell, Moon, Globe, Download, Trash2, ChevronRight, LogOut, Zap, LucideIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

interface SettingItem {
    label: string;
    value?: string;
    icon: LucideIcon;
    danger?: boolean;
    onClick?: () => void;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [notifStatus, setNotifStatus] = useState<string>(
        typeof Notification !== 'undefined' ? Notification.permission : 'not-supported'
    );

    const requestNotifs = async () => {
        if (typeof Notification === 'undefined' || Notification.permission === 'not-supported') return;
        const permission = await Notification.requestPermission();
        setNotifStatus(permission);
    };

    const SETTINGS_SECTIONS: SettingSection[] = [
        {
            title: 'Profile & Regional',
            items: [
                { label: 'Display Name', value: session?.user?.name || 'User', icon: User },
                { label: 'Timezone', value: 'UTC+5:30', icon: Globe },
                { label: 'Start of Day', value: '3:00 AM', icon: Moon },
            ]
        },
        {
            title: 'Privacy & Security',
            items: [
                { label: 'Sync Status', value: 'Active', icon: Zap },
                { label: 'Account Security', value: 'Encrypted', icon: ShieldCheck },
            ]
        },
        {
            title: 'Notifications & Data',
            items: [
                {
                    label: 'Push Notifications',
                    value: notifStatus === 'granted' ? 'Enabled' : notifStatus === 'denied' ? 'Blocked' : 'Tap to Enable',
                    icon: Bell,
                    onClick: requestNotifs
                },
                { label: 'Export Rituals (JSON)', icon: Download },
                { label: 'Delete My Data', icon: Trash2, danger: true },
            ]
        }
    ];

    return (
        <div className="flex flex-col gap-8 pb-32 lg:pb-12 lg:pt-12">
            <header className="px-6">
                <h1 className="text-5xl font-black tracking-tighter text-white">Settings</h1>
                <p className="text-muted-foreground mt-2 font-medium text-lg text-primary">Preferences and account management.</p>
            </header>

            <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {SETTINGS_SECTIONS.map((section) => (
                    <section key={section.title} className="flex flex-col gap-4">
                        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] pl-2">
                            {section.title}
                        </h2>
                        <div className="bg-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
                            {section.items.map((item, j) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className={cn(
                                        "w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all text-left group",
                                        j !== section.items.length - 1 && "border-b border-white/5",
                                        item.danger && "text-red-500"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-lg",
                                            item.danger ? "bg-red-500/10" : "bg-primary/10 text-primary"
                                        )}>
                                            <item.icon size={22} />
                                        </div>
                                        <div>
                                            <span className="font-bold block text-sm">{item.label}</span>
                                            {item.value && <span className="text-xs text-muted-foreground font-medium">{item.value}</span>}
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-muted-foreground/30 transition-transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="px-6">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/20 shadow-2xl">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="" className="w-full h-full rounded-full" />
                            ) : (
                                <User size={32} className="text-primary" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white">{session?.user?.name || 'Ritual Expert'}</h3>
                            <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">{session?.user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-muted-foreground font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5 group"
                    >
                        <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                        Deactivate Session
                    </button>
                </div>
                <p className="text-center mt-8 text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em]">
                    Ritual SaaS Platform • Production Environment
                </p>
            </div>
        </div>
    );
}
