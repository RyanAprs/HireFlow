import { createClient } from "@/lib/supabase/server"
import JobsList from "@/components/jobs/jobs-list"
import { Button } from "@/components/ui/button"
import { Briefcase, User, LogOut } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data

    // Redirect admin to admin dashboard
    if (profile?.role === "admin") {
      redirect("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">HireFlow</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/my-applications">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
                <form action="/api/auth/logout" method="post">
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Job Opportunities</h1>
          <p className="text-gray-600">Find your next career move</p>
        </div>

        <JobsList userId={user?.id} />
      </main>
    </div>
  )
}
