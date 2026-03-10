"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";

export default function AdminLogin() {
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
            const res = await api.post("/auth/admin/login", { email, password });
            login(res.data.token, { ...res.data, role: "admin" });
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-slate-50 w-full rounded-3xl mt-4">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full point-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-full mb-4 shadow-sm ring-1 ring-indigo-200">
                        <Shield className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h2>
                    <p className="mt-2 text-sm text-slate-500">Secure access for placement coordinators.</p>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email</label>
                                    <Input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@college.edu"
                                        className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secure Password</label>
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all duration-300 hover:brightness-110 text-base font-medium flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                {loading ? "Authenticating..." : (
                                    <>Authorize Access <ArrowRight className="h-4 w-4" /></>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
