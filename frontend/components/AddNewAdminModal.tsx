"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import api from "@/lib/api";
import { BRANCH_OPTIONS } from "@/lib/constants";

export default function AddNewAdminModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        department: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (!formData.department) {
            setError("Please select a department");
            setLoading(false);
            return;
        }

        try {
            await api.post("/admin/register-new", formData);
            setSuccess("New Admin Registered!");
            
            // Clear form
            setFormData({ name: "", email: "", password: "", department: "" });
            
            // Close up after short delay so toast is visible
            setTimeout(() => {
                onClose();
                setSuccess("");
            }, 1000);
            
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                        Create a coordinator account for a specific department.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {success && <div className="text-emerald-600 bg-emerald-50 p-2 rounded text-sm font-medium">{success}</div>}
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="admin@college.edu"
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            name="password"
                            type="text" // Kept text instead of password to make it easier for admin to copy-paste and send securely if needed, but standard is type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Strong password"
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Department Role</label>
                        <select
                            name="department"
                            required
                            value={formData.department}
                            onChange={handleChange}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                            disabled={loading}
                        >
                            <option value="" disabled>Select Department</option>
                            {BRANCH_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? "Registering..." : "Create Admin Account"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
