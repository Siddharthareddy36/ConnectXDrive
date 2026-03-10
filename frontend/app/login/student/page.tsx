"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function StudentLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // NOTE: In real dev, this endpoint must point to backend
            const res = await api.post("/auth/student/login", { email, password });
            login(res.data.token, { ...res.data, role: "student" });
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 w-full rounded-3xl mt-4">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full point-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4 shadow-sm ring-1 ring-blue-200">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Portal</h2>
                    <p className="mt-2 text-sm text-slate-500">Welcome back! Sign in to manage your placement profile.</p>
                </div>

                <Card className="border-slate-200 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <CardContent className="pt-8 px-8 pb-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">College Email</label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="student@college.edu"
                                        className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all duration-300 hover:brightness-110 text-base font-medium flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : (
                                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                                )}
                            </Button>

                            <div className="mt-8 text-center text-sm border-t border-slate-100 pt-6">
                                <span className="text-slate-500">Don't have an account? </span>
                                <a href="/register/student" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                    Register now
                                </a>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
