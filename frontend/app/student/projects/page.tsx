"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Github, ExternalLink, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
    id: number;
    title: string;
    description: string;
    tech_stack: string;
    github_link: string;
    live_link: string;
}

export default function StudentProjects() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tech_stack: "",
        github_link: "",
        live_link: ""
    });

    useEffect(() => {
        if (!authLoading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');

        if (user) {
            fetchProjects();
        }
    }, [user, authLoading, router]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student/projects');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects", err);
            setError("Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await api.post('/student/projects', formData);
            await fetchProjects();
            setShowForm(false);
            setFormData({ title: "", description: "", tech_stack: "", github_link: "", live_link: "" });
        } catch (err: any) {
            console.error("Failed to add project", err);
            setError(err.response?.data?.message || "Failed to add project.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.delete(`/student/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err: any) {
            console.error("Failed to delete project", err);
            setError(err.response?.data?.message || "Failed to delete project.");
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading projects...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">My Projects</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-2">Showcase your academic and personal projects to recruiters.</p>
                </div>
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className={`w-full md:w-auto shadow-md transition-all duration-300 ${showForm ? "bg-slate-200 text-slate-700 hover:bg-slate-300 shadow-none" : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 hover:scale-[1.02] text-white"}`}
                >
                    {showForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Project</>}
                </Button>
            </motion.div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="mb-8 border border-indigo-200/60 shadow-md bg-white rounded-xl">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-indigo-500" /> Add New Project
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project Title</label>
                                        <Input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. E-Commerce Website" className="focus:border-indigo-300 focus:ring-indigo-100 transition-all font-medium" />
                                    </div>
                                    <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                                        <textarea
                                            required
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="What did you build? What problems did it solve?"
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:border-indigo-300 transition-all resize-y"
                                        />
                                    </div>
                                    <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tech Stack (Comma separated)</label>
                                        <Input required name="tech_stack" value={formData.tech_stack} onChange={handleChange} placeholder="React, Node.js, MySQL" className="focus:border-indigo-300 focus:ring-indigo-100 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">GitHub Link</label>
                                            <Input name="github_link" value={formData.github_link} onChange={handleChange} placeholder="https://github.com/..." className="focus:border-indigo-300 focus:ring-indigo-100 transition-all" />
                                        </div>
                                        <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Demo Link</label>
                                            <Input name="live_link" value={formData.live_link} onChange={handleChange} placeholder="https://..." className="focus:border-indigo-300 focus:ring-indigo-100 transition-all" />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all h-10 mt-2">
                                        {submitting ? "Adding Project..." : "Save Project"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {projects.length === 0 && !showForm ? (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-slate-200/60 shadow-sm"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-indigo-50/50">
                        <Briefcase className="w-10 h-10 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No projects added yet</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">Add your top projects to demonstrate your practical experience to recruiters.</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={project.id}
                        >
                            <Card className="flex flex-col h-full border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl bg-white hover:-translate-y-1 group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <CardHeader className="bg-slate-50/30 pb-3">
                                    <CardTitle className="flex justify-between items-start">
                                        <span className="text-lg font-semibold text-slate-800 leading-tight pr-4">{project.title}</span>
                                        <div className="flex gap-2 shrink-0">
                                            {project.github_link && (
                                                <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-100 rounded-md">
                                                    <Github className="h-4 w-4" />
                                                </a>
                                            )}
                                            {project.live_link && (
                                                <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-md">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow pt-3">
                                    <p className="text-sm text-slate-600 mb-6 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tech_stack.split(',').map((tech, i) => {
                                            const normalized = tech.trim();
                                            if (!normalized) return null;
                                            return (
                                                <span key={i} className="px-2.5 py-1 bg-indigo-50/80 text-xs font-medium rounded-md text-indigo-700 border border-indigo-100/50">
                                                    {normalized}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/50 group-hover:bg-white transition-colors">
                                    <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium h-8" onClick={() => handleDelete(project.id)}>
                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Project
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
