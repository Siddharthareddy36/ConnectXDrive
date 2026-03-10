"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

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
            // Backend returns: { id, skill_name, message }
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
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">My Skills</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Skill Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Skill</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddSkill} className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="e.g. React, Python, Java"
                                disabled={adding}
                            />
                            <Button type="submit" disabled={adding || !newSkill.trim()}>
                                {adding ? <span className="animate-spin">...</span> : <Plus className="h-4 w-4" />}
                                <span className="sr-only">Add</span>
                            </Button>
                        </form>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                {/* Skills List Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {skills.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No skills added yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill) => (
                                    <div
                                        key={skill.id}
                                        className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center gap-2 border border-blue-100"
                                    >
                                        <span className="font-medium">{skill.skill_name}</span>
                                        <button
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="text-blue-400 hover:text-red-500 transition-colors"
                                            title="Delete skill"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
