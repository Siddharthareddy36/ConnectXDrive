"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { motion } from "framer-motion";
import { User, Mail, Hash, Phone, Building, Target, CheckCircle, Github, Link as LinkIcon, Briefcase } from "lucide-react";
import { BRANCH_OPTIONS } from "@/lib/constants";

export default function StudentProfile() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "", // Read only
        roll_no: "", // Read only
        email: "", // Read only
        phone: "",
        branch: "",
        cgpa: "",
        backlogs: "0", // Storing as string "0" or "1" for select/logic, will convert on submit
        github: "",
        portfolio: "",
        internship_details: ""
    });

    useEffect(() => {
        if (!authLoading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');

        if (user) {
            fetchProfile();
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/profile');
            const data = res.data;
            setFormData({
                name: data.name || "",
                roll_no: data.roll_no || "",
                email: data.email || "",
                phone: data.phone || "",
                branch: data.branch || "",
                cgpa: data.cgpa || "",
                backlogs: data.backlogs ? "1" : "0",
                github: data.github || "",
                portfolio: data.portfolio || "",
                internship_details: data.internship_details || ""
            });
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBacklogsChange = (value: string) => {
        setFormData({ ...formData, backlogs: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            if (!formData.branch) {
                setError("Please select a branch.");
                setSaving(false);
                return;
            }
            await api.put('/student/profile', {
                ...formData,
                backlogs: formData.backlogs === "1" // Convert to boolean for backend check if needed, or 0/1 depending on schema. 
                // Controller says: `const backlogsVal = backlogs ? 1 : 0;` based on req.body.backlogs truthiness. 
                // If I send "1" (string), "1" is true. If "0", "0" is true. 
                // Wait, logic in controller: `const backlogsVal = backlogs ? 1 : 0;` 
                // If I send boolean true/false it works. 
                // If I send string "1", it's truthy -> 1. 
                // If I send string "0", it's truthy -> 1. 
                // Ah, string "0" is truthy in JS. I must send boolean or empty/null for false if I want 0.
                // Let's send boolean.
                // Actually controller logic: `const backlogsVal = backlogs ? 1 : 0;`
                // So I should send boolean `true` for yes, `false` or `0` or `null` for no.
                // `formData.backlogs` is "1" or "0".
                // So: `backlogs: formData.backlogs === "1"`
            });
            setSuccess("Profile updated successfully!");
        } catch (err: any) {
            console.error("Failed to update profile", err);
            setError(err.response?.data?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading profile...</div>;

    // Calculate progress roughly
    const fields = ['name', 'roll_no', 'email', 'phone', 'branch', 'cgpa', 'github', 'portfolio', 'internship_details'];
    const filledFields = fields.filter(field => formData[field as keyof typeof formData] && formData[field as keyof typeof formData].toString().trim() !== '');
    const progress = Math.round((filledFields.length / fields.length) * 100);

    return (
        <ClientOnly>
            <ErrorBoundary>
                <div className="max-w-5xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
                        <p className="text-slate-500 mt-1">Manage your personal information and academic records.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Progress Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <Card className="border-none shadow-sm ring-1 ring-slate-100 bg-white sticky top-24">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-semibold text-slate-800">Profile Completeness</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center">
                                    <div className="relative w-32 h-32 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="56" className="text-slate-100" strokeWidth="12" fill="none" stroke="currentColor" />
                                            <circle cx="64" cy="64" r="56" className="text-indigo-600 transition-all duration-1000 ease-in-out" strokeWidth="12" fill="none" stroke="currentColor" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * progress) / 100} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold tracking-tighter text-slate-800">{progress}%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-6 text-center">
                                        {progress === 100 ? "Your profile is complete! You are ready for placements." : "Complete your profile to increase your chances of getting shortlisted."}
                                    </p>
                                    {progress === 100 && (
                                        <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" /> Ready for Drives
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Main Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                                        {error}
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> {success}
                                    </motion.div>
                                )}

                                {/* Standard Info Card */}
                                <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                            <User className="w-4 h-4 text-indigo-500" /> Identity Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" /> Full Name
                                            </label>
                                            <Input value={formData.name} disabled className="bg-slate-50 border-slate-200 text-slate-500 shadow-none font-medium" />
                                        </div>
                                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                                <Hash className="w-3.5 h-3.5" /> Roll Number
                                            </label>
                                            <Input value={formData.roll_no} disabled className="bg-slate-50 border-slate-200 text-slate-500 shadow-none font-medium" />
                                        </div>
                                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors md:col-span-2">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> College Email
                                            </label>
                                            <Input value={formData.email} disabled className="bg-slate-50 border-slate-200 text-slate-500 shadow-none font-medium" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Academic details */}
                                <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                            <Building className="w-4 h-4 text-purple-500" /> Academic & Contact
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5 group">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                                                <Phone className="w-3.5 h-3.5" /> Phone Number
                                            </label>
                                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" className="transition-all focus:border-purple-300 focus:ring-purple-100" />
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                                                <Building className="w-3.5 h-3.5" /> Branch
                                            </label>
                                            <select
                                                name="branch"
                                                value={formData.branch}
                                                onChange={handleChange}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all"
                                            >
                                                <option value="" disabled>Choose your Department</option>
                                                {BRANCH_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                                                <Target className="w-3.5 h-3.5" /> CGPA
                                            </label>
                                            <Input name="cgpa" value={formData.cgpa} onChange={handleChange} placeholder="8.5" type="number" step="0.01" min="0" max="10" className="transition-all focus:border-purple-300 focus:ring-purple-100" />
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-purple-600 transition-colors">
                                                Active Backlogs?
                                            </label>
                                            <select
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all"
                                                value={formData.backlogs}
                                                onChange={(e) => handleBacklogsChange(e.target.value)}
                                            >
                                                <option value="" disabled>Select status</option>
                                                <option value="0">No backlogs</option>
                                                <option value="1">Yes, I have backlogs</option>
                                            </select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Links and Details */}
                                <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                        <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4 text-blue-500" /> Professional Presence
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                                    <Github className="w-3.5 h-3.5" /> GitHub Profile
                                                </label>
                                                <Input name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" className="transition-all focus:border-blue-300 focus:ring-blue-100" />
                                            </div>
                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                                    <LinkIcon className="w-3.5 h-3.5" /> Portfolio / Website
                                                </label>
                                                <Input name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://myportfolio.com" className="transition-all focus:border-blue-300 focus:ring-blue-100" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 group">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
                                                <Briefcase className="w-3.5 h-3.5" /> Internship Details
                                            </label>
                                            <textarea
                                                name="internship_details"
                                                value={formData.internship_details}
                                                onChange={handleChange}
                                                placeholder="Describe your internships, role, duration, and key learnings... Make it comprehensive for recruiters."
                                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-300 transition-all resize-y"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end pt-2">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 px-8 py-6 rounded-xl text-base">
                                            {saving ? "Saving Changes..." : "Save Profile Updates"}
                                        </Button>
                                    </motion.div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </ErrorBoundary>
        </ClientOnly>
    );
}
