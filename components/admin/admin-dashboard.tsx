"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Briefcase, LogOut, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store"
import JobPositionsList from "./job-positions-list"
import CreateJobPosition from "./create-job-position"
import ApplicationsList from "./applications-list"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("jobs")
  const router = useRouter()
  const { profile, setProfile } = useAuthStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">HireFlow Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{profile?.full_name}</span>
              <span className="text-gray-400 ml-2">({profile?.email})</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

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
  )
}
