"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Building, Calendar, CheckCircle } from "lucide-react";

export default function StudentDrivesPage() {
    const { token } = useAuth();
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/student/drives", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDrives(data);
                }
            } catch (error) {
                console.error("Error fetching drives:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchDrives();
    }, [token]);

    const handleApply = async (driveId) => {
        setApplying(driveId);
        setMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/student/drives/apply", {
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
                setDrives(drives.filter(d => d.id !== driveId));
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
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Placement Drives</h1>
                    <p className="text-gray-500 mt-1">Discover and apply for drives matching your branch.</p>
                </div>
            </div>

            {message && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <p>{message}</p>
                </div>
            )}

            {drives.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No active drives</h3>
                    <p className="text-gray-500 mt-1">There are currently no active placement drives for your branch.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <motion.div
                            key={drive.id}
                            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{drive.company_name}</h3>
                                    <p className="text-indigo-600 font-medium">{drive.role}</p>
                                </div>
                                <div className="bg-indigo-50 p-2 rounded-lg">
                                    <Building className="h-5 w-5 text-indigo-600" />
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-6 flex-grow">{drive.description}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Drive Date: {new Date(drive.drive_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-red-500 font-medium">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Deadline: {new Date(drive.application_deadline).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={() => handleApply(drive.id)}
                                disabled={applying === drive.id}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {applying === drive.id ? "Applying..." : "Apply Now"}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
