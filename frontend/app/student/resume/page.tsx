"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Upload, CheckCircle } from "lucide-react";

export default function StudentResume() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [currentResume, setCurrentResume] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login/student');
        if (user && user.role !== 'student') router.push('/');

        // Check if user has resume (available in user object usually, or fetch profile)
        if (user) {
            fetchProfile();
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/student/profile');
            // Check if resume_path is present
            if (res.data.resume_path) {
                setCurrentResume(res.data.resume_path);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage({ text: "", type: "" });

        const formData = new FormData();
        formData.append("resume", file);

        try {
            const res = await api.post('/student/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ text: "Resume uploaded successfully!", type: "success" });
            setCurrentResume(res.data.path);
            setFile(null);
            // Optionally update user context if resume path is part of it
        } catch (err: any) {
            console.error("Upload failed", err);
            setMessage({ text: err.response?.data?.message || "Upload failed.", type: "error" });
        } finally {
            setUploading(false);
        }
    };

    if (authLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Resume Upload</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Upload Your Resume (PDF)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {currentResume && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-3 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                                <p className="font-medium">Resume is uploaded</p>
                                <p className="text-xs opacity-80 mt-1">Uploading again will replace the current file.</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                <span className="text-gray-600 font-medium">Click to select PDF file</span>
                                <span className="text-sm text-gray-400 mt-1">Max size: 5MB</span>
                            </label>
                            {file && (
                                <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                    Selected: {file.name}
                                </div>
                            )}
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded text-sm text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={uploading || !file}>
                            {uploading ? "Uploading..." : "Upload Resume"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
