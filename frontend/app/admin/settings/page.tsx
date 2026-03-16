"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Bell, Shield, Loader2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function AdminSettingsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [profile, setProfile] = useState({ name: '', email: '', department: '' });
    const [notifications, setNotifications] = useState({ drive_notifications: true, application_updates: true, shortlist_alerts: true });
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (!token) return;
                const res = await axios.get(`${API_BASE_URL}/api/admin/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(res.data.profile);
                setNotifications(res.data.notifications);
            } catch (error) {
                console.error('Failed to fetch admin settings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [token]);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/admin/update-profile`, 
                { name: profile.name, email: profile.email }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage("Profile updated successfully", "success");
        } catch (error: any) {
            showMessage(error.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNotifications = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/admin/notification-settings`, 
                notifications, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage("Notification preferences saved", "success");
        } catch (error: any) {
            showMessage(error.response?.data?.message || "Failed to save preferences", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            return showMessage("New passwords do not match", "error");
        }
        setSaving(true);
        try {
            await axios.put(`${API_BASE_URL}/api/admin/change-password`, 
                { current_password: passwordData.current_password, new_password: passwordData.new_password }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage("Password changed successfully", "success");
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error: any) {
            showMessage(error.response?.data?.message || "Failed to change password", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-800 bg-clip-text text-transparent mb-2">Admin Settings</h1>
            <p className="text-gray-500 mb-8">Manage your admin profile and system preferences.</p>

            {message.text && (
                <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200 border' : 'bg-red-50 text-red-800 border-red-200 border'}`}>
                    {message.text}
                </div>
            )}

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8 p-1 bg-slate-100 rounded-lg inline-flex w-full overflow-x-auto sm:w-auto h-auto">
                    <TabsTrigger value="profile" className="flex gap-2 py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md"><User className="w-4 h-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="notifications" className="flex gap-2 py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md"><Bell className="w-4 h-4" /> Notifications</TabsTrigger>
                    <TabsTrigger value="security" className="flex gap-2 py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-md"><Shield className="w-4 h-4" /> Security</TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Admin Profile</CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="space-y-2 sm:max-w-xs">
                                        <Label htmlFor="department">Department <span className="text-xs text-slate-400 font-normal">(Read-only)</span></Label>
                                        <Input id="department" value={profile.department} disabled className="bg-slate-50 text-slate-500" />
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving} className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Profile
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications */}
                <TabsContent value="notifications">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Configure alerts for your department.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateNotifications} className="space-y-6">
                                <div className="flex items-center justify-between space-x-2 border-b border-slate-100 pb-4">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="app_updates" className="text-base font-medium">New Applications Alerts</Label>
                                        <span className="text-sm text-slate-500">Get notified when a student applies for a drive.</span>
                                    </div>
                                    <Switch id="app_updates" checked={notifications.application_updates} onCheckedChange={(c) => setNotifications({...notifications, application_updates: c})} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border-b border-slate-100 pb-4">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="shortlist_alerts" className="text-base font-medium">Shortlist Updates</Label>
                                        <span className="text-sm text-slate-500">Receive alerts when shortlists are updated.</span>
                                    </div>
                                    <Switch id="shortlist_alerts" checked={notifications.shortlist_alerts} onCheckedChange={(c) => setNotifications({...notifications, shortlist_alerts: c})} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 pb-2">
                                    <div className="flex flex-col space-y-1">
                                        <Label htmlFor="drive_notif" className="text-base font-medium">Drive Notifications</Label>
                                        <span className="text-sm text-slate-500">Alerts regarding upcoming drives in your department.</span>
                                    </div>
                                    <Switch id="drive_notif" checked={notifications.drive_notifications} onCheckedChange={(c) => setNotifications({...notifications, drive_notifications: c})} />
                                </div>
                                <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Preferences
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security */}
                <TabsContent value="security">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your admin password securely.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password</Label>
                                    <Input id="current_password" type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">New Password</Label>
                                    <Input id="new_password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                                    <Input id="confirm_password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})} required />
                                </div>
                                <Button type="submit" disabled={saving} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Update Password
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
