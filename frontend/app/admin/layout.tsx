"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login/admin');
        if (user && user.role !== 'admin') router.push('/');
    }, [user, loading, router]);

    if (loading || !user) return <div className="p-8 text-center text-gray-500">Loading your workspace...</div>;

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64">
                <TopNav />
                <main className="flex-1 p-6 lg:p-10 pt-24 min-h-screen transition-all">
                    {children}
                </main>
            </div>
        </div>
    );
}
