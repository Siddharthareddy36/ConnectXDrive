"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, Lock, Building, CheckCircle2, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Link from "next/link";

const DEPARTMENTS = ["DS", "IT", "AIML", "CS-Cybersecurity", "CSE"];

export default function AddNewAdmin() {
    const { user, loading, token } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        department: "",
        password: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    // Protect route
    if (!loading && (!user || user.role !== 'admin')) {
        router.push('/');
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(""); // Clear error on edit
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.department || !formData.password) {
            setError("All fields are required.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            await axios.post(
                'http://localhost:5000/api/admin/add-new',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage("New Admin Added Successfully!");
            setFormData({ name: "", email: "", department: "", password: "" });

            // Auto hide success message
            setTimeout(() => setSuccessMessage(""), 5000);

        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register new coordinator.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <UserPlus className="h-8 w-8 text-indigo-600" /> Register Coordinator
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Add a new department admin to the Placement Intelligence Portal.
                    </p>
                </div>
                <Link href="/admin/dashboard">
                    <Button variant="outline" className="border-slate-200">
                        Back to Dashboard
                    </Button>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="border-none shadow-xl ring-1 ring-slate-200/50 bg-white/60 backdrop-blur-xl overflow-hidden relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Coordinator Details</CardTitle>
                        <p className="text-sm text-slate-500">Enter the credentials for the new administrator.</p>
                    </CardHeader>
                    <CardContent>

                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-start gap-3"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                                    <div className="text-sm font-medium">{successMessage}</div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-400" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus:shadow-md"
                                        placeholder="e.g. Jane Doe"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" /> Work Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus:shadow-md"
                                            placeholder="jane.doe@university.edu"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-slate-400" /> Department
                                        </label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus:shadow-md"
                                            required
                                        >
                                            <option value="" disabled>Select Department</option>
                                            {DEPARTMENTS.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow focus:shadow-md"
                                        placeholder="Min. 8 characters"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold shadow-lg shadow-indigo-200"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Registering Coordinator...
                                        </div>
                                    ) : (
                                        "Register Coordinator"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
