"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Code, Sparkles } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { motion } from "framer-motion";

interface Skill {
    id: number;
    skill_name: string;
}

export default function StudentSkills() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');

        if (user) {
            fetchSkills();
        }
    }, [user, authLoading, router]);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/skills');
            setSkills(res.data);
        } catch (err) {
            console.error("Failed to fetch skills", err);
            setError("Failed to load skills.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSkill.trim()) return;

        try {
            setAdding(true);
            const res = await api.post('/student/skills', { skill: newSkill });
            const addedSkill = { id: res.data.id, skill_name: res.data.skill_name };
            setSkills([...skills, addedSkill]);
            setNewSkill("");
        } catch (err: any) {
            console.error("Failed to add skill", err);
            setError(err.response?.data?.message || "Failed to add skill.");
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSkill = async (id: number) => {
        if (!confirm("Are you sure you want to delete this skill?")) return;
        try {
            await api.delete(`/student/skills/${id}`);
            setSkills(skills.filter(s => s.id !== id));
        } catch (err: any) {
            console.error("Failed to delete skill", err);
            setError(err.response?.data?.message || "Failed to delete skill.");
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading skills...</div>;

    return (
        <ClientOnly>
            <ErrorBoundary>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8 pt-6">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">My Skills</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-2">Highlight your technical abilities to stand out to recruiters.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Add Skill Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="md:col-span-1"
                        >
                            <Card className="border border-slate-200/60 shadow-md transition-all duration-300 bg-white rounded-xl sticky top-24">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-500" /> Add New Skill
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleAddSkill} className="flex flex-col gap-3">
                                        <Input
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="e.g. React, Python, Java"
                                            disabled={adding}
                                            className="focus:ring-indigo-100 focus:border-indigo-300 transition-all font-medium"
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={adding || !newSkill.trim()}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 hover:scale-[1.02] text-white shadow-md transition-all h-10"
                                        >
                                            {adding ? <span className="animate-spin">...</span> : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" /> Add Skill
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                    {error && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-3 p-2 bg-red-50 rounded-md border border-red-100">
                                            {error}
                                        </motion.p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Skills List Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2"
                        >
                            <Card className="border border-slate-200/60 shadow-md transition-all duration-300 bg-white rounded-xl min-h-[300px]">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                        <Code className="w-4 h-4 text-emerald-500" /> Your Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {skills.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="flex flex-col items-center justify-center py-16 text-center"
                                        >
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                                                <Code className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800">No skills added yet</h3>
                                            <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">Add your first skill to improve your profile and increase your visibility to recruiters.</p>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {skills.map((skill, index) => {
                                                const colors = [
                                                    "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300",
                                                    "bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300",
                                                    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300",
                                                    "bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300",
                                                    "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300",
                                                    "bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-300"
                                                ];
                                                const currColor = colors[index % colors.length];
                                                
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        key={skill.id}
                                                        className={`px-4 py-2 rounded-xl flex items-center gap-3 border shadow-sm transition-all duration-300 group cursor-default ${currColor}`}
                                                    >
                                                        <Code className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                        <span className="font-semibold text-sm tracking-wide">{skill.skill_name}</span>
                                                        <button
                                                            onClick={() => handleDeleteSkill(skill.id)}
                                                            className="opacity-50 hover:opacity-100 hover:text-red-500 transition-all ml-1 p-1 hover:bg-white rounded-md hover:shadow-sm"
                                                            title="Delete skill"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </ErrorBoundary>
        </ClientOnly>
    );
}
