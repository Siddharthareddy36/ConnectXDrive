"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');
    }, [user, loading, router]);

    if (loading || !user) return <div className="p-8 text-center text-gray-500">Loading your workspace...</div>;

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col lg:ml-64">
                <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 lg:p-10 pt-24 min-h-screen transition-all">
                    {children}
                </main>
            </div>
        </div>
    );
}

