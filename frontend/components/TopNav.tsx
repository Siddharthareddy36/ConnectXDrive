"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, User, LogOut, UserPlus, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import AddNewAdminModal from "./AddNewAdminModal";
import { Button } from "@/components/ui/button";

export default function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout } = useAuth();
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

    if (!user) return null;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-md border-b border-gray-200 z-50 flex items-center justify-between px-4 sm:px-6 lg:ml-64 transition-all">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <button 
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 hidden sm:block">
                    ConnectXDrive
                </h1>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 sm:hidden">
                    CXD
                </h1>
            </div>            <div className="flex items-center gap-4 sm:gap-6">
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
                    {user.role === 'admin' && (
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 shadow-sm"
                            onClick={() => setIsAddAdminOpen(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span className="font-medium text-xs">Add New Admin</span>
                        </Button>
                    )}
                    <div className="hidden sm:flex flex-col items-end pl-2 border-l border-gray-200">
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
            
            {user.role === 'admin' && (
                <AddNewAdminModal 
                    isOpen={isAddAdminOpen} 
                    onClose={() => setIsAddAdminOpen(false)} 
                />
            )}
        </header >
    );
}
