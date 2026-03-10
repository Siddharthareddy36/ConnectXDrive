"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Plus, Github, ExternalLink } from "lucide-react";

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
            const res = await api.post('/student/projects', formData);
            // Backend returns { id, message } usually. 
            // We should reload details or fake it.
            // Let's refetch or fake. Backend addProject returns { id: ..., message: ... }
            // It doesn't return full object. I'll fetch fresh list to be safe.
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
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Projects</h1>
                <Button onClick={() => setShowForm(!showForm)} className={showForm ? "bg-gray-500" : ""}>
                    {showForm ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Add Project</>}
                </Button>
            </div>

            {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}

            {showForm && (
                <Card className="mb-8 border-blue-200">
                    <CardHeader>
                        <CardTitle>Add New Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project Title</label>
                                <Input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. E-Commerce Website" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the project..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tech Stack (Comma users)</label>
                                <Input required name="tech_stack" value={formData.tech_stack} onChange={handleChange} placeholder="React, Node.js, MySQL" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">GitHub Link</label>
                                    <Input name="github_link" value={formData.github_link} onChange={handleChange} placeholder="https://github.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Live Demo Link</label>
                                    <Input name="live_link" value={formData.live_link} onChange={handleChange} placeholder="https://..." />
                                </div>
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "Adding Project..." : "Add Project"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.length === 0 && !showForm && (
                    <p className="col-span-2 text-center text-gray-500 py-12">No projects added yet.</p>
                )}

                {projects.map((project) => (
                    <Card key={project.id} className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <span>{project.title}</span>
                                <div className="flex gap-2">
                                    {project.github_link && (
                                        <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
                                            <Github className="h-5 w-5" />
                                        </a>
                                    )}
                                    {project.live_link && (
                                        <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tech_stack.split(',').map((tech, i) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700">
                                        {tech.trim()}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t">
                            <Button variant="ghost" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(project.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
