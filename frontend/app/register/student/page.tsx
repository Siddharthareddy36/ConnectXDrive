"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ClientOnly from "@/components/ClientOnly";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BRANCH_OPTIONS } from "@/lib/constants";

export default function StudentRegister() {
    const [formData, setFormData] = useState({
        name: "",
        roll_no: "",
        email: "",
        password: "",
        confirmPassword: "",
        branch: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (!formData.branch) {
            setError("Please choose a valid branch");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/auth/student/register", {
                name: formData.name,
                roll_no: formData.roll_no,
                email: formData.email,
                password: formData.password,
                branch: formData.branch,
            });

            // Login immediately after registration
            login(res.data.token, { ...res.data, role: "student" });
            // Redirect handled by login function inside context (usually) or we can push manually if context doesn't auto redirect on login call (it does)
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ClientOnly>
            <ErrorBoundary>
                <div className="flex justify-center items-center py-12">
                    <Card className="w-[500px]">
                        <CardHeader>
                            <CardTitle className="text-center text-2xl">Student Registration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Roll Number</label>
                                    <Input
                                        name="roll_no"
                                        required
                                        value={formData.roll_no}
                                        onChange={handleChange}
                                        placeholder="123456"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Branch <span className="text-red-500">*</span></label>
                                    <select
                                        name="branch"
                                        required
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                                    >
                                        <option value="" disabled>Choose your Department</option>
                                        {BRANCH_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">College Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="student@college.edu"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            name="password"
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Confirm Password</label>
                                        <Input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                                    {loading ? "Registering..." : "Register & Login"}
                                </Button>

                                <div className="text-center mt-4">
                                    <a href="/login/student" className="text-sm text-blue-600 hover:underline">
                                        Already have an account? Login here
                                    </a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </ErrorBoundary>
        </ClientOnly>
    );
}
