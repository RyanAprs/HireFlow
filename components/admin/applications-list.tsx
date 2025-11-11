"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Application, JobPosition, Profile } from "@/lib/types"
import { Eye, User } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ApplicationWithDetails = Application & {
  job_position: JobPosition
  applicant: Profile
}

export default function ApplicationsList() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchApplications = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("applications")
      .select(
        `
        *,
        job_position:job_positions(*),
        applicant:profiles(*)
      `,
      )
      .order("created_at", { ascending: false })

    if (data) setApplications(data as unknown as ApplicationWithDetails[])
    setIsLoading(false)
  }

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", appId)
    fetchApplications()
    if (selectedApp?.id === appId) {
      setSelectedApp({ ...selectedApp, status: status as Application["status"] })
    }
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
    return <div className="text-center py-8">Loading applications...</div>
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">No applications received yet.</CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.profile_photo_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{app.applicant.full_name}</CardTitle>
                    <p className="text-sm text-gray-600">{app.job_position.title}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(app.status)}>{app.status.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <Select value={app.status} onValueChange={(value) => updateStatus(app.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedApp(app)
                      setShowDetails(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant.full_name} - {selectedApp?.job_position.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Applicant Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedApp?.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{selectedApp?.applicant.full_name}</h3>
                <p className="text-sm text-gray-600">{selectedApp?.applicant.email}</p>
              </div>
            </div>

            {/* Form Data */}
            <div>
              <h3 className="font-semibold mb-3">Application Responses</h3>
              <div className="space-y-3">
                {selectedApp?.form_data &&
                  Object.entries(selectedApp.form_data).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-700 mb-1">{key}</div>
                      <div className="text-sm">{String(value)}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h3 className="font-semibold mb-2">Update Status</h3>
              <Select
                value={selectedApp?.status}
                onValueChange={(value) => selectedApp && updateStatus(selectedApp.id, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
