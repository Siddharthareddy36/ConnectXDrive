"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Code, FileText, Briefcase, Activity, CheckCircle2, Clock, Trophy, BarChart3, Layers } from "lucide-react";
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
        { title: "My Profile", icon: User, href: "/student/profile", desc: "Manage personal and academic information" },
        { title: "My Skills", icon: Code, href: "/student/skills", desc: "Update and manage technical skills" },
        { title: "My Projects", icon: Briefcase, href: "/student/projects", desc: "Showcase academic and personal projects" },
        { title: "Upload Resume", icon: FileText, href: "/student/resume", desc: "Upload your resume for placement eligibility" },
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8 pt-6">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
                    >
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Welcome back, {user.name} 👋
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground mt-2 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Your placement readiness is improving.
                            </p>
                        </div>
                    </motion.div>

                    {/* Main Action Cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {activeCards.map((card, index) => {
                            const colors = [
                                "text-indigo-600 bg-indigo-50",
                                "text-emerald-600 bg-emerald-50",
                                "text-purple-600 bg-purple-50",
                                "text-blue-600 bg-blue-50"
                            ];
                            const gradients = [
                                "from-indigo-500 to-indigo-400",
                                "from-emerald-500 to-emerald-400",
                                "from-purple-500 to-purple-400",
                                "from-blue-500 to-blue-400"
                            ];
                            const currColor = colors[index % colors.length];
                            const currGrad = gradients[index % gradients.length];

                            return (
                                <motion.div variants={itemVariants} key={card.title}>
                                    <Link href={card.href} className="block h-full">
                                        <Card className="h-full border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-indigo-500/30 overflow-hidden group cursor-pointer relative">
                                            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${currGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                                                <CardTitle className="text-sm font-semibold text-slate-800">
                                                    {card.title}
                                                </CardTitle>
                                                <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] ${currColor}`}>
                                                    <card.icon className="h-4 w-4" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="z-10 relative">
                                                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Placement Insights */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 pt-6"
                    >
                        <h2 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Placement Insights
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md bg-white">
                                <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-500">Profile Strength</p>
                                        <Trophy className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold text-slate-900">75%</h3>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full w-[75%]" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md bg-white">
                                <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-500">Skills Added</p>
                                        <Code className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold text-slate-900">4</h3>
                                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600">+1 this week</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md bg-white">
                                <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-500">Projects Count</p>
                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold text-slate-900">2</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Ready for showcase</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-200/60 shadow-sm transition-all duration-300 hover:shadow-md bg-white">
                                <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium text-slate-500">Applications</p>
                                        <Layers className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-2xl font-bold text-slate-900">3</h3>
                                        <p className="text-xs text-muted-foreground mt-1">2 in review</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Profile Status Alert */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-4"
                    >
                        <Card className="border-indigo-100/50 shadow-sm transition-all duration-300 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 overflow-hidden relative">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100/80 text-amber-700 border border-amber-200 mb-2">
                                                Profile Pending Approval
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                Complete your profile and upload your resume to become eligible for upcoming placement drives.
                                            </p>
                                        </div>
                                        <Link href="/student/profile">
                                            <Button className="w-full sm:w-auto mt-4 sm:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 hover:scale-105 text-white transition-all shadow-md h-9 px-6 text-sm">
                                                Complete Profile
                                            </Button>
                                        </Link>
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
