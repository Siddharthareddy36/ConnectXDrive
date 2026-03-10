"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Send, Calendar, Building, Clock, CheckCircle, XCircle } from "lucide-react";

export default function StudentApplicationsPage() {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/student/applications", {
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

    const getStatusConfig = (status) => {
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
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Applications</h1>
                    <p className="text-gray-500 mt-1">Track the status of your placement applications.</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                    <p className="text-gray-500 mt-1">You haven't applied to any placement drives yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 test-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="p-4 pl-6">Company</th>
                                    <th className="p-4">Drive Date</th>
                                    <th className="p-4">Applied On</th>
                                    <th className="p-4 pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {applications.map((app) => {
                                    const StatusIcon = getStatusConfig(app.status).icon;
                                    return (
                                        <motion.tr
                                            key={app.application_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="font-semibold text-gray-900">{app.company_name}</div>
                                                <div className="text-sm text-gray-500">{app.role}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {new Date(app.drive_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {new Date(app.applied_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 pr-6">
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
