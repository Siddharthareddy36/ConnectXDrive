"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { Send, Calendar, Building, Clock, CheckCircle, XCircle } from "lucide-react";

export default function StudentApplicationsPage() {
    const { token } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/student/applications`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setApplications(data);
                }
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchApplications();
    }, [token]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "shortlisted":
                return { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle };
            case "rejected":
                return { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle };
            default:
                return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock };
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your applications...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-12 pt-6">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">My Applications</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-2">Track the status of your placement applications.</p>
                </div>
            </motion.div>

            {applications.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200/60 shadow-sm"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-indigo-50/50">
                        <Send className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No applications yet</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">You haven't applied to any placement drives yet. Check the Drives section to explore opportunities.</p>
                </motion.div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200/60 text-xs uppercase tracking-wider text-slate-500 font-semibold whitespace-nowrap">
                                    <th className="p-4 pl-6">Company</th>
                                    <th className="p-4">Drive Date</th>
                                    <th className="p-4">Applied On</th>
                                    <th className="p-4 pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.map((app) => {
                                    const StatusIcon = getStatusConfig(app.status).icon;
                                    return (
                                        <motion.tr
                                            key={app.application_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/50 transition-colors"
                                        >
                                            <td className="p-4 pl-6 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{app.company_name}</div>
                                                <div className="text-sm text-slate-500">{app.role}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                                {new Date(app.drive_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                                {new Date(app.applied_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 pr-6 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusConfig(app.status).color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
