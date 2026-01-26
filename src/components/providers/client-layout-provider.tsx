'use client';

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AddHabitModal } from "@/components/habits/add-habit-modal";

export function ClientLayoutProvider({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar onAddClick={() => setIsModalOpen(true)} />
            {children}
            <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
