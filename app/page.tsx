import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, FileText, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">HireFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-balance mb-6 text-gray-900">Streamline Your Hiring Process</h1>
        <p className="text-xl text-gray-600 text-balance mb-8 max-w-2xl mx-auto">
          Modern hiring management platform for creating job postings and managing applications with ease
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/sign-up">
            <Button size="lg" className="gap-2">
              Get Started
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              Browse Jobs
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose HireFlow?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Easy Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create and manage job positions with custom application forms</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Dynamic Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Configure custom fields for each position to gather the exact information you need
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Applicant Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                User-friendly interface for job seekers to browse and apply to positions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Track Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor application status and manage candidates throughout the hiring process
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 HireFlow. Built with Next.js, Supabase & Vercel.</p>
        </div>
      </footer>
    </div>
  )
}
