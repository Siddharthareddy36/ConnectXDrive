"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Building, GraduationCap, Github, ExternalLink, FileText, CheckCircle, XCircle } from "lucide-react";

interface StudentData {
    id: number;
    name: string;
    email: string;
    phone: string;
    branch: string;
    roll_no: string;
    cgpa: number;
    resume_path: string | null;
    is_approved: boolean | number;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
}

interface Skill {
    id: number;
    student_id: number;
    skill_name: string;
}

interface Project {
    id: number;
    title: string;
    description: string;
    tech_stack: string;
    github_link: string;
    live_link: string;
}

export default function AdminStudentProfilePage() {
    const { user, token, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const studentId = params.id;

    const [student, setStudent] = useState<StudentData | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!authLoading && !user) router.push('/login/admin');
        if (user && user.role !== 'admin') router.push('/');

        if (user && studentId) {
            fetchStudentProfile();
        }
    }, [user, authLoading, router, studentId]);

    const fetchStudentProfile = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/admin/student/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setStudent(res.data.student);
            setSkills(res.data.skills || []);
            setProjects(res.data.projects || []);
        } catch (err: any) {
            console.error("Error fetching student profile", err);
            setError(err.response?.data?.message || "Failed to load student profile");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) return <p className="p-8 text-center text-gray-500">Loading student profile...</p>;

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">{error}</div>
        </div>
    );

    if (!student) return <p className="p-8 text-center text-gray-500">Student not found</p>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{student.name}</h1>
                    <p className="text-gray-500">Student Profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Basic Info & Resume */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex justify-between items-center">
                                <span>Basic Information</span>
                                {student.is_approved ? (
                                    <span className="inline-flex items-center p-1 rounded-full text-green-600" title="Approved">
                                        <CheckCircle className="h-5 w-5" />
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center p-1 rounded-full text-yellow-600" title="Pending">
                                        <XCircle className="h-5 w-5" />
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Roll Number</p>
                                    <p className="text-sm font-semibold">{student.roll_no || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Department</p>
                                    <p className="text-sm font-semibold">{student.branch}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                    <a href={`mailto:${student.email}`} className="text-sm font-semibold text-blue-600 hover:underline">{student.email}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-sm font-semibold">{student.phone || "N/A"}</p>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <div className="bg-blue-50 p-4 rounded-xl text-center">
                                    <p className="text-sm text-blue-800 font-medium tracking-wide uppercase">Current CGPA</p>
                                    <p className="text-3xl font-bold text-blue-700 mt-1">{student.cgpa}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle>Resume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {student.resume_path ? (
                                <Button 
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700" 
                                    onClick={() => window.open(`${API_BASE_URL}/${student.resume_path}`, "_blank")}
                                >
                                    <FileText className="h-4 w-4" /> View Resume
                                </Button>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No resume uploaded</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Column 2: Skills & Projects */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Technologies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <span key={skill.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                            {skill.skill_name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No skills listed.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Projects ({projects.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="border border-gray-100 p-4 rounded-xl flex flex-col h-full bg-white hover:shadow-sm transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900">{project.title}</h3>
                                                <div className="flex gap-2">
                                                    {project.github_link && (
                                                        <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                                                            <Github className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {project.live_link && (
                                                        <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4 flex-grow">{project.description}</p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {project.tech_stack.split(',').map((tech, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-[11px] rounded text-gray-600 font-medium">
                                                        {tech.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500">No projects listed.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
