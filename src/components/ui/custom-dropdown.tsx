'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
    id: string | null;
    name: string;
    color?: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string | null;
    onChange: (value: string | null) => void;
    label: string;
}

export function CustomDropdown({ options, value, onChange, label }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.id === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-w-[220px] hover:bg-white/10 transition-all group"
            >
                <div className="flex items-center gap-3">
                    {selectedOption.id && (
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: selectedOption.color || 'var(--primary)' }}
                        />
                    )}
                    <span className="font-bold text-sm text-white">
                        {selectedOption.id === null ? label : selectedOption.name}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    className={cn(
                        "text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-180 text-white"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 right-0 z-[100] bg-[#1c1c1e] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-2 backdrop-blur-xl"
                    >
                        {options.map((option) => (
                            <button
                                key={option.id || 'all'}
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl transition-all text-left group",
                                    value === option.id
                                        ? "bg-primary text-white"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={cn(
                                            "w-2 h-2 rounded-full",
                                            !option.id && "bg-muted-foreground"
                                        )}
                                        style={option.color ? { backgroundColor: option.color } : {}}
                                    />
                                    <span className="font-semibold text-sm">{option.name}</span>
                                </div>
                                {value === option.id && <Check size={16} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
