import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import MyApplicationsList from "@/components/jobs/my-applications-list"
import { Button } from "@/components/ui/button"
import { Briefcase, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function MyApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">HireFlow</span>
          </div>
          <Link href="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        <MyApplicationsList userId={user.id} />
      </main>
    </div>
  )
}
