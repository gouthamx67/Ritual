import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SyncStatus } from "@/components/layout/sync-status";
import { AuthProvider } from "@/components/providers/session-provider";
import { ReminderManager } from "@/components/habits/reminder-manager";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ClientLayoutProvider } from "@/components/providers/client-layout-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ritual - Master Your Habits",
  description: "A premium habit tracking experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#09090b] text-foreground`}>
        <AuthProvider>
          {/* Background Mesh Gradients */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
          </div>

          <ClientLayoutProvider>
            <ReminderManager />
            <MobileHeader />

            <main className="flex-1 lg:ml-72 min-h-screen relative shadow-2xl bg-background/40 backdrop-blur-sm border-x border-white/5 lg:border-none pt-20 lg:pt-0">
              <div className="max-w-5xl mx-auto min-h-screen">
                <SyncStatus />
                {children}
              </div>
            </main>
          </ClientLayoutProvider>

          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
