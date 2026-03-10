"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Building, Calendar, Users, PlusCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDrivesPage() {
    const { token } = useAuth();
    const router = useRouter();
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        company_name: "",
        role: "",
        description: "",
        eligible_departments: [],
        drive_date: "",
        application_deadline: ""
    });

    const ALL_DEPARTMENTS = ['DS', 'IT', 'AIML', 'CS-Cybersecurity', 'CSE'];

    useEffect(() => {
        fetchDrives();
    }, [token]);

    const fetchDrives = async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:5000/api/admin/drives", {
                headers: { Authorization: `Bearer ${token}` },
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

    const handleDepartmentToggle = (dept) => {
        setFormData(prev => ({
            ...prev,
            eligible_departments: prev.eligible_departments.includes(dept)
                ? prev.eligible_departments.filter(d => d !== dept)
                : [...prev.eligible_departments, dept]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const res = await fetch("http://localhost:5000/api/admin/drives", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Drive created successfully!");
                setShowForm(false);
                setFormData({
                    company_name: "", role: "", description: "", eligible_departments: [], drive_date: "", application_deadline: ""
                });
                fetchDrives();
            } else {
                setMessage(data.message || "Failed to create drive");
            }
        } catch (error) {
            setMessage("Server error creating drive");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading active drives...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Placement Drives</h1>
                    <p className="text-gray-500 mt-1">Manage active placement drives and create new ones.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                >
                    <PlusCircle className="h-5 w-5" />
                    {showForm ? "Cancel" : "Create Drive"}
                </button>
            </div>

            {message && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <p>{message}</p>
                </div>
            )}

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
                >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Placement Drive</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.company_name}
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    placeholder="e.g. Google"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                    placeholder="e.g. Data Scientist"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                placeholder="Drive details, package, requirements..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Departments</label>
                            <div className="flex flex-wrap gap-3">
                                {ALL_DEPARTMENTS.map(dept => (
                                    <button
                                        type="button"
                                        key={dept}
                                        onClick={() => handleDepartmentToggle(dept)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${formData.eligible_departments.includes(dept)
                                                ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Drive Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.drive_date}
                                    onChange={e => setFormData({ ...formData, drive_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.application_deadline}
                                    onChange={e => setFormData({ ...formData, application_deadline: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Create Drive
                        </button>
                    </form>
                </motion.div>
            )}

            {drives.length === 0 && !showForm ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No active drives</h3>
                    <p className="text-gray-500 mt-1">You haven't created any placement drives yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drives.map((drive) => (
                        <Link href={`/admin/drives/${drive.id}`} key={drive.id}>
                            <motion.div
                                whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full cursor-pointer hover:border-indigo-100"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{drive.company_name}</h3>
                                        <p className="text-indigo-600 font-medium">{drive.role}</p>
                                    </div>
                                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                        <Users className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-6 flex-grow line-clamp-2">{drive.description}</p>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Drive: {new Date(drive.drive_date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-red-500 font-medium">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Deadline: {new Date(drive.application_deadline).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 text-indigo-600 text-sm font-medium flex items-center justify-between">
                                    <span>Manage Applicants</span>
                                    <span>&rarr;</span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
