"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Code, FileText, Briefcase, LayoutDashboard, Search, Settings, Building, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const pathname = usePathname();
    const { user } = useAuth();

    const studentNavItems = [
        { title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
        { title: "Profile", href: "/student/profile", icon: User },
        { title: "Skills", href: "/student/skills", icon: Code },
        { title: "Projects", href: "/student/projects", icon: Briefcase },
        { title: "Resume", href: "/student/resume", icon: FileText },
        { title: "Drives", href: "/student/drives", icon: Building },
        { title: "My Applications", href: "/student/applications", icon: Send },
        { title: "Settings", href: "/student/settings", icon: Settings },
    ];

    const adminNavItems = [
        { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { title: "Filter Students", href: "/admin/filter", icon: Search },
        { title: "Drives", href: "/admin/drives", icon: Building },
        { title: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside 
                className={`fixed left-0 top-0 h-screen w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 z-50 pt-20 pb-8 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-5 right-4 p-2 text-gray-500 hover:text-gray-700 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                
                <div className="px-6 mb-8">
                    <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Menu</h2>
                </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive
                                    ? "text-white shadow-md shadow-indigo-200/50"
                                    : "text-slate-600 hover:bg-indigo-50/80 hover:text-indigo-600"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-100 z-0" />
                                )}
                                <item.icon className={`h-4 w-4 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-100" : ""}`} />
                                <span className="text-sm font-medium relative z-10">{item.title}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>
            {user?.role === 'student' && (
                <div className="px-6 mt-auto">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-xs font-medium text-indigo-800">Placement Preparation</p>
                        <p className="text-xs text-indigo-600 mt-1">Keep your profile updated for better visibility.</p>
                    </div>
                </div>
            )}
            {user?.role === 'admin' && (
                <div className="px-6 mt-auto">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-medium text-slate-800">Admin Controls</p>
                        <p className="text-xs text-slate-500 mt-1">Manage platform settings and view analytics.</p>
                    </div>
                </div>
            )}
            </aside>
        </>
    );
}
