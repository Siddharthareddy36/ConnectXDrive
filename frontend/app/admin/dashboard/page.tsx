"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Users, CheckCircle, Search, FileText, Activity, Clock, SlidersHorizontal, Building, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    const { user, loading, token } = useAuth(); // Assuming AuthContext exposes token. If not, get from localStorage or logic.
    const router = useRouter();

    const [stats, setStats] = useState({
        totalStudents: 0,
        approvedStudents: 0,
        avgProjects: 0
    });
    const [statsLoading, setStatsLoading] = useState(true);
    const [drives, setDrives] = useState([]);

    useEffect(() => {
        if (!loading && !user) router.push('/login/admin');
        if (user && user.role !== 'admin') router.push('/');

        if (user && user.role === 'admin' && token) {
            // Fetch stats
            axios.get('http://localhost:5000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setStats(res.data);
                })
                .catch(err => {
                    console.error("Failed to fetch dashboard stats", err);
                })
                .finally(() => {
                    setStatsLoading(false);
                });

            // Fetch active drives
            axios.get('http://localhost:5000/api/admin/drives', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setDrives(res.data);
                })
                .catch(err => console.error("Failed to fetch drives", err));
        }
    }, [user, loading, router, token]);

    if (loading || !user) return <p>Loading...</p>;

    const statCards = [
        {
            title: "Total Students",
            value: stats.totalStudents,
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-100",
            border: "border-indigo-500",
            link: "/admin/filter"
        },
        {
            title: "Approved Profiles",
            value: stats.approvedStudents,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
            border: "border-emerald-500"
        },
        {
            title: "Avg. Projects",
            value: stats.avgProjects,
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-100",
            border: "border-purple-500",
            isEmpty: stats.avgProjects === 0
        },
        {
            title: "Pending Reviews",
            value: Math.max(0, stats.totalStudents - stats.approvedStudents),
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100",
            border: "border-amber-500"
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
    };

    // Prepare chart data
    const chartData = [
        { name: 'Approved', value: stats.approvedStudents },
        { name: 'Pending', value: Math.max(0, stats.totalStudents - stats.approvedStudents) },
    ];
    const COLORS = ['#10b981', '#f59e0b']; // Emerald for approved, Amber for pending

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {user?.department ? `${user.department} Control Center` : "Control Center"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {user?.department
                            ? `Manage placement activities and health metrics for ${user.department}`
                            : "Platform-wide health metrics and user management"}
                    </p>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {statCards.map((stat, i) => (
                    stat.link ? (
                        <motion.div variants={itemVariants} key={stat.title}>
                            <Link href={stat.link} className="block h-full">
                                <Card className="cursor-pointer h-full border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} rounded-bl-full opacity-20 -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            {stat.title}
                                        </CardTitle>
                                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {statsLoading ? (
                                            <div className="h-8 w-16 bg-slate-200 animate-pulse rounded col-span-1"></div>
                                        ) : stat.isEmpty ? (
                                            <div className="text-sm font-medium text-slate-400 mt-2">No data yet</div>
                                        ) : (
                                            <div className="text-3xl font-extrabold text-slate-800">{stat.value}</div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div variants={itemVariants} key={stat.title}>
                            <Card className="h-full border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 bg-white relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bg} rounded-bl-full opacity-20 -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {statsLoading ? (
                                        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded col-span-1"></div>
                                    ) : stat.isEmpty ? (
                                        <div className="text-sm font-medium text-slate-400 mt-2">No data yet</div>
                                    ) : (
                                        <div className="text-3xl font-extrabold text-slate-800">{stat.value}</div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                ))}
            </motion.div>

            {/* Horizontal Action Bar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
                <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
                        Quick Actions
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Target resources and filter specific student segments.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href="/admin/filter" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm ring-1 ring-slate-200/50 hover:ring-indigo-300 transition-all font-medium text-sm h-10 px-4">
                            <Search className="h-4 w-4 mr-2 text-indigo-500" />
                            Open Filter Engine
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Removed the large horizontal card for filtering, implemented as Action Bar above */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md"
            >
                {/* Visual Chart */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" /> Placement Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 h-64 flex flex-col justify-center items-center">
                        {statsLoading ? (
                            <div className="w-40 h-40 rounded-full border-8 border-slate-100 border-t-indigo-200 animate-spin"></div>
                        ) : stats.totalStudents === 0 ? (
                            <p className="text-sm text-slate-500">No student data available.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Active Drives Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full mt-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building className="h-5 w-5 text-indigo-500" /> Active Placement Drives
                    </h2>
                    <Link href="/admin/drives" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View All <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {drives.length === 0 ? (
                    <Card className="border-slate-200 shadow-sm bg-white p-8 text-center">
                        <p className="text-slate-500">No active placement drives found.</p>
                        <Link href="/admin/drives">
                            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">Create New Drive</Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drives.slice(0, 3).map((drive) => (
                            <Link href={`/admin/drives/${drive.id}`} key={drive.id}>
                                <Card className="h-full border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold text-slate-900">{drive.company_name}</CardTitle>
                                        <p className="text-sm font-medium text-indigo-600">{drive.role}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 mt-2">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                                                Drive: {new Date(drive.drive_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-sm text-amber-600 font-medium">
                                                <Clock className="h-4 w-4 mr-2" />
                                                Deadline: {new Date(drive.application_deadline).toLocaleDateString()}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-slate-50">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Eligible</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {drive.eligible_departments.split(',').map((dept, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                                            {dept.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
