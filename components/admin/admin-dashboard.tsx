"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import JobPositionsList from "./job-positions-list";
import CreateJobPosition from "./create-job-position";
import ApplicationsList from "./applications-list";
import Header from "./header";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("jobs");
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header handleLogout={handleLogout} profile={profile} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage job positions and applications</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Job Positions
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <CreateJobPosition />
            <JobPositionsList />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
