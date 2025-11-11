"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Application, JobPosition } from "@/lib/types"
import { useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"

type ApplicationWithJob = Application & {
  job_position: JobPosition
}

export default function MyApplicationsList({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get("success") === "true"

  const supabase = createClient()

  const fetchApplications = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("applications")
      .select(
        `
        *,
        job_position:job_positions(*)
      `,
      )
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false })

    if (data) setApplications(data as unknown as ApplicationWithJob[])
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "interview":
        return "bg-purple-100 text-purple-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading your applications...</div>
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Application submitted successfully!</p>
          </CardContent>
        </Card>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t submitted any applications yet.</p>
            <p className="text-sm text-gray-400">Browse available positions and apply to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{app.job_position.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied on {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(app.status)}>{app.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{app.job_position.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
