"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, User, LogOut, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TopNav() {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-6 lg:ml-64 transition-all">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                    Placement Intel
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {user.role === 'admin' && (
                    <Link href="/admin/register">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                            title="Add New Admin"
                        >
                            <UserPlus className="h-5 w-5" />
                        </motion.button>
                    </Link>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </motion.button>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{user.role === 'admin' && user.department ? `${user.department} Coordinator` : user.role}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white cursor-pointer select-none">
                        <span className="text-sm font-bold">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center gap-2 p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Logout"
                >
                    <LogOut className="h-5 w-5" />
                </motion.button>
            </div>
        </header>
    );
}
