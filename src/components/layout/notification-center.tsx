'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Zap, Trophy, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getNotifications, markAsRead, generateDisciplineAI } from '@/lib/actions/notification-actions';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!session?.user?.id) return;
        const data = await getNotifications(session.user.id);
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
    };

    useEffect(() => {
        if (session?.user?.id) {
            loadNotifications();
            // Generate AI insights occasionally when opening center
            if (Math.random() > 0.7) generateDisciplineAI(session.user.id);
        }
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) loadNotifications();
                }}
                className="relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group active:scale-95"
            >
                <Bell
                    size={24}
                    className={cn(
                        "text-muted-foreground group-hover:text-white transition-colors",
                        unreadCount > 0 && "animate-bounce"
                    )}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full border-2 border-[#09090b] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-4 right-0 md:left-0 md:right-auto w-80 md:w-96 bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                            <h3 className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                                Insights
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">AI</span>
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground p-6">
                                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                                        <MessageSquare size={24} className="opacity-20" />
                                    </div>
                                    <p className="font-bold text-sm">All caught up!</p>
                                    <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Insights are generated as you use the app</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleMarkRead(n.id)}
                                        className={cn(
                                            "w-full p-4 rounded-3xl text-left transition-all border flex gap-4",
                                            n.read
                                                ? "bg-transparent border-transparent opacity-50"
                                                : "bg-white/5 border-white/5 shadow-lg"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center",
                                            n.type === 'SUGGESTION' ? "bg-primary/20 text-primary" :
                                                n.type === 'REMINDER' ? "bg-orange-500/20 text-orange-500" :
                                                    "bg-yellow-500/20 text-yellow-500"
                                        )}>
                                            {n.type === 'SUGGESTION' ? <Zap size={20} /> :
                                                n.type === 'REMINDER' ? <CheckCircle2 size={20} /> :
                                                    <Trophy size={20} />}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-bold text-white mb-0.5">{n.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{n.message}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(59,130,246,1)]" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-white/2">
                            <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-[0.3em]">
                                Powered by Ritual AI Engine
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
