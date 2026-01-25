'use client';

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Flame, Chrome, UserCircle } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleDemoLogin = async () => {
        setIsLoading(true);
        await signIn("credentials", {
            email: "demo@ritual.app",
            callbackUrl: "/"
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-8 p-6 rounded-[2.5rem] bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/10"
            >
                <Flame size={64} className="text-primary fill-primary/20" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
                    Ritual
                </h1>
                <p className="text-muted-foreground text-lg font-medium max-w-[280px] mx-auto leading-relaxed">
                    Master your habits with science-backed streaks.
                </p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-12 w-full max-w-sm flex flex-col gap-4"
            >
                <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="flex items-center justify-center gap-3 w-full p-5 rounded-3xl bg-white text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                >
                    <Chrome size={24} />
                    Continue with Google
                </button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/5"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Or</span>
                    </div>
                </div>

                <button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 w-full p-5 rounded-3xl bg-primary/20 text-primary font-bold text-lg border border-primary/30 hover:bg-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <UserCircle size={24} />
                            Try Demo Mode
                        </>
                    )}
                </button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-sm text-muted-foreground font-medium"
            >
                Private • Offline Sync • Supabase Cloud
            </motion.p>
        </div>
    );
}
