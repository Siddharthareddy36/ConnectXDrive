"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, XCircle } from "lucide-react";

interface Student {
    id: number;
    name: string;
    branch: string;
    cgpa: number;
    skills: string[];
    project_count: number;
    is_approved: boolean | number; // Handling both 0/1 and boolean
}

export default function AdminFilterPage() {
    const { user, token, loading } = useAuth();
    const router = useRouter();

    const [minCgpa, setMinCgpa] = useState("");
    const [skills, setSkills] = useState("");
    const [internship, setInternship] = useState(false);
    const [hasProjects, setHasProjects] = useState(false);

    const [students, setStudents] = useState<Student[]>([]);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!loading && !user) router.push('/login/admin');
        if (user && user.role !== 'admin') router.push('/');
    }, [user, loading, router]);

    const fetchStudents = async () => {
        setFetching(true);
        try {
            const params = new URLSearchParams();
            if (minCgpa) params.append("min_cgpa", minCgpa);
            if (skills) params.append("skills", skills);
            if (internship) params.append("internship", "true");
            if (hasProjects) params.append("has_projects", "true");

            // Backend handles department filtering automatically via token
            const res = await axios.get(`http://localhost:5000/api/admin/students?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStudents(res.data);
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setFetching(false);
        }
    };

    const approveStudent = async (id: number) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/student/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setStudents(prev => prev.map(s => s.id === id ? { ...s, is_approved: true } : s));
        } catch (error) {
            console.error("Error approving student", error);
        }
    };

    if (loading || !user) return <p className="p-8">Loading...</p>;

    return (
        <div className="space-y-6 container mx-auto py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Filter Students</h1>
                    <p className="text-gray-500">Shortlist students based on criteria</p>
                </div>
            </div>

            {/* Filter Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filter Criteria</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA</label>
                        <Input
                            type="number"
                            placeholder="e.g. 7.5"
                            value={minCgpa}
                            onChange={(e) => setMinCgpa(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                        <Input
                            type="text"
                            placeholder="Java, React"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pb-3">
                        <input
                            type="checkbox"
                            id="internship"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={internship}
                            onChange={(e) => setInternship(e.target.checked)}
                        />
                        <label htmlFor="internship" className="text-sm text-gray-700">Has Internship</label>
                    </div>

                    <div className="flex items-center space-x-2 pb-3">
                        <input
                            type="checkbox"
                            id="projects"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={hasProjects}
                            onChange={(e) => setHasProjects(e.target.checked)}
                        />
                        <label htmlFor="projects" className="text-sm text-gray-700">Has Projects</label>
                    </div>

                    <div className="md:col-span-4 flex justify-end">
                        <Button onClick={fetchStudents} className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Apply Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Results ({students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-gray-500 text-sm">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Branch</th>
                                    <th className="p-3">CGPA</th>
                                    <th className="p-3">Skills</th>
                                    <th className="p-3">Projects</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {students.length === 0 && !fetching && (
                                    <tr>
                                        <td colSpan={7} className="p-4 text-center text-gray-500">No students found. Apply filters to search.</td>
                                    </tr>
                                )}
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{student.name}</td>
                                        <td className="p-3 text-sm text-gray-600">{student.branch}</td>
                                        <td className="p-3 text-sm">{student.cgpa}</td>
                                        <td className="p-3 text-sm text-gray-600">{(student.skills || []).join(', ')}</td>
                                        <td className="p-3 text-sm text-center">{student.project_count || 0}</td>
                                        <td className="p-3">
                                            {student.is_approved ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {!student.is_approved && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                                    onClick={() => approveStudent(student.id)}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
