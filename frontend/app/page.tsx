"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus, ShieldCheck, BarChart3 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else router.push('/student/dashboard');
    }
  }, [user, router]);

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-slate-50 -z-10" />
      <div className="absolute top-0 -translate-y-12 right-0 -translate-x-1/4 w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 translate-y-1/4 left-0 translate-x-1/4 w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-8 max-w-4xl px-4 z-10"
      >
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold tracking-wide shadow-sm border border-blue-100">
          Introducing the next generation platform
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          Placement <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Intelligence Portal
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Streamlining the college placement process. Manage profiles, track skills, and connect with opportunities efficiently.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login/student">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1">
              Student Portal <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login/admin">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1">
              Admin Access
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-6 z-10"
      >
        <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">For Students</h3>
          <p className="text-slate-500 leading-relaxed">Build your professional profile, showcase your key projects, and manage your resume all in one centralized place.</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">For Coordinators</h3>
          <p className="text-slate-500 leading-relaxed">Filter and shortlist candidates instantly based on specific tech skills, CGPA requirements, and real-world project experience.</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">Advanced Analytics</h3>
          <p className="text-slate-500 leading-relaxed">Get deep, actionable insights into your batch's placement readiness, skill distributions, and overall health metrics.</p>
        </div>
      </motion.div>
    </div>
  );
}
