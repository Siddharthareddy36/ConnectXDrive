"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Code, FileText, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { motion } from "framer-motion";

export default function StudentDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');
    }, [user, loading, router]);

    if (loading || !user) return <p>Loading...</p>;

    const activeCards = [
        { title: "My Profile", icon: User, href: "/student/profile", desc: "Manage personal details & academic info" },
        { title: "My Skills", icon: Code, href: "/student/skills", desc: "Update technical skills" },
        { title: "My Projects", icon: Briefcase, href: "/student/projects", desc: "Showcase your work" },
        { title: "Upload Resume", icon: FileText, href: "/student/resume", desc: "Update your CV" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
    };

    return (
        <ClientOnly>
            <ErrorBoundary>
                <div className="space-y-8 max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Student Dashboard</h1>
                            <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{user.name}</span>. Here's what's happening today.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {activeCards.map((card, index) => {
                            const colors = [
                                "bg-indigo-100 text-indigo-600 border-indigo-500",
                                "bg-emerald-100 text-emerald-600 border-emerald-500",
                                "bg-purple-100 text-purple-600 border-purple-500",
                                "bg-blue-100 text-blue-600 border-blue-500"
                            ];
                            const currColor = colors[index % colors.length];

                            return (
                                <motion.div variants={itemVariants} key={card.title}>
                                    <Link href={card.href} className="block h-full">
                                        <Card className="h-full border-none shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] bg-white ring-1 ring-slate-100 overflow-hidden group">
                                            <div className={`h-1 w-full ${currColor.split(' ')[0].replace('100', '500')}`} />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-base font-semibold text-slate-800">
                                                    {card.title}
                                                </CardTitle>
                                                <div className={`p-2 rounded-full transition-colors group-hover:bg-opacity-80 ${currColor.split(' ').slice(0, 2).join(' ')}`}>
                                                    <card.icon className="h-5 w-5" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        <Card className="lg:col-span-2 border-slate-200 shadow-sm transition-all duration-300 bg-white relative overflow-hidden group">
                            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
                                    <span>Profile Status</span>
                                    {/* Pill Badge for Status */}
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 shadow-sm">
                                        <Clock className="w-3.5 h-3.5" />
                                        Pending Approval
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
                                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 shadow-sm">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="font-semibold text-slate-800 mb-1">
                                                Almost there!
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                Complete your profile and upload your resume to get approved for placement drives.
                                            </p>
                                        </div>
                                        <Link href="/student/profile">
                                            <Button className="w-full sm:w-auto mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 transition-transform shadow-md shadow-indigo-600/20">
                                                Complete Profile
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Profile Completion Progress Bar */}
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-slate-700">Profile Completion</span>
                                            <span className="text-sm font-bold text-indigo-600">75%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "75%" }}
                                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full flex items-center justify-end shadow-md transition-all"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-white/50 mr-1 animate-pulse" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </ErrorBoundary>
        </ClientOnly>
    );
}
