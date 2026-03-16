"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";
import { motion } from "framer-motion";
import { Building, Calendar, CheckCircle } from "lucide-react";

export default function StudentDrivesPage() {
    const { token } = useAuth();
    const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);
    const [ongoingDrives, setOngoingDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/student/drives`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUpcomingDrives(data.upcoming_drives || []);
                    setOngoingDrives(data.ongoing_drives || []);
                }
            } catch (error) {
                console.error("Error fetching drives:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDrives();
    }, [token]);

    const handleApply = async (driveId: string) => {
        setApplying(driveId);
        setMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/student/drives/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ drive_id: driveId }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Applied successfully!");
                // Remove drive from list or update UI
                setUpcomingDrives(upcomingDrives.filter(d => d.id !== driveId));
                setOngoingDrives(ongoingDrives.filter(d => d.id !== driveId));
            } else {
                setMessage(data.message || "Failed to apply");
            }
        } catch (error) {
            setMessage("Server error while applying");
        } finally {
            setApplying(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your eligible drives...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in pb-12 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Placement Drives</h1>
                    <p className="text-gray-500 mt-1">Discover and apply for drives matching your branch.</p>
                </div>
            </div>

            {message && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <p>{message}</p>
                </div>
            )}

            {upcomingDrives.length === 0 && ongoingDrives.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No active drives</h3>
                    <p className="text-gray-500 mt-1">There are currently no active placement drives for your branch.</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Ongoing Drives Section */}
                    {ongoingDrives.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Ongoing Drives
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ongoingDrives.map((drive) => (
                                    <motion.div
                                        key={drive.id}
                                        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-[100px] -z-0"></div>
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{drive.company_name}</h3>
                                                <p className="text-emerald-600 font-medium">{drive.role}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-2 rounded-lg">
                                                <Building className="h-5 w-5 text-emerald-600" />
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-6 flex-grow relative z-10">{drive.description}</p>

                                        <div className="space-y-3 mb-6 relative z-10">
                                            <div className="flex items-center text-sm text-emerald-700 font-medium">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Started: {new Date(drive.drive_start_date || drive.drive_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-sm text-red-500 font-medium">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Ends: {new Date(drive.drive_end_date || drive.application_deadline).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApply(drive.id)}
                                            disabled={applying === drive.id}
                                            className="w-full relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {applying === drive.id ? "Applying..." : "Apply Now"}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Drives Section */}
                    {upcomingDrives.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Upcoming Drives
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingDrives.map((drive) => (
                                    <motion.div
                                        key={drive.id}
                                        whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{drive.company_name}</h3>
                                                <p className="text-indigo-600 font-medium">{drive.role}</p>
                                            </div>
                                            <div className="bg-indigo-50 p-2 rounded-lg">
                                                <Building className="h-5 w-5 text-indigo-600" />
                                            </div>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-6 flex-grow relative z-10">{drive.description}</p>

                                        <div className="space-y-3 mb-6 relative z-10">
                                            <div className="flex items-center text-sm text-indigo-700 font-medium">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Starts: {new Date(drive.drive_start_date || drive.drive_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Ends: {new Date(drive.drive_end_date || drive.application_deadline).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleApply(drive.id)}
                                            disabled={applying === drive.id}
                                            className="w-full relative z-10 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {applying === drive.id ? "Applying..." : "Apply Now"}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
