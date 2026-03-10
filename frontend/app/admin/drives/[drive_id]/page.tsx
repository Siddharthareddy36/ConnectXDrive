"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Download, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDriveApplicantsPage() {
    const { token } = useAuth();
    const params = useParams();
    const router = useRouter();
    const drive_id = params.drive_id;

    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && drive_id) {
            fetchApplicants();
        }
    }, [token, drive_id]);

    const fetchApplicants = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/drives/${drive_id}/applicants`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplicants(data);
            }
        } catch (error) {
            console.error("Error fetching applicants:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (applicationId, action) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/applications/${applicationId}/${action}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Update local state instead of refetching for speed
                setApplicants(applicants.map(app =>
                    app.application_id === applicationId
                        ? { ...app, status: action === 'shortlist' ? 'shortlisted' : 'rejected' }
                        : app
                ));
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
        }
    };

    const handleExport = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/drives/${drive_id}/shortlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `drive_${drive_id}_shortlist.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }
        } catch (error) {
            console.error("Error exporting shortlist:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading applicants...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Applicants</h1>
                    <p className="text-gray-500 mt-1">Review student applications and shortlist candidates.</p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                    >
                        <Download className="h-4 w-4" />
                        Export Shortlist
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4 pl-6">Student Name</th>
                                <th className="p-4">Branch</th>
                                <th className="p-4">CGPA</th>
                                <th className="p-4">Resume</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applicants.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No applicants for this drive yet.</td>
                                </tr>
                            ) : (
                                applicants.map((app) => (
                                    <motion.tr
                                        key={app.application_id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="p-4 pl-6 font-medium text-gray-900">{app.name}</td>
                                        <td className="p-4 text-sm text-gray-600">{app.branch}</td>
                                        <td className="p-4 text-sm font-medium text-gray-900">{app.cgpa}</td>
                                        <td className="p-4 text-sm">
                                            {app.resume_path ? (
                                                <a
                                                    href={`http://localhost:5000/${app.resume_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                                                >
                                                    <FileText className="h-4 w-4" /> View Resume
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 italic">No Resume</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'}`}
                                            >
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleAction(app.application_id, 'shortlist')}
                                                disabled={app.status === 'shortlisted'}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <CheckCircle className="h-4 w-4" /> Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleAction(app.application_id, 'reject')}
                                                disabled={app.status === 'rejected'}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <XCircle className="h-4 w-4" /> Reject
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
