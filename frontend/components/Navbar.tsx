"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b bg-white">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Placement Portal
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600">
                                Welcome, {user.name} ({user.role})
                            </span>
                            <Button variant="outline" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login/student">
                                <Button variant="ghost">Student Login</Button>
                            </Link>
                            <Link href="/login/admin">
                                <Button>Admin Login</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
