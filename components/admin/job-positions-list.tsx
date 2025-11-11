"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { JobPosition, FormField } from "@/lib/types"
import { MapPin, Briefcase, DollarSign, Eye, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function JobPositionsList() {
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null)
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchJobs = async () => {
    setIsLoading(true)
    const { data } = await supabase.from("job_positions").select("*").order("created_at", { ascending: false })

    if (data) setJobs(data)
    setIsLoading(false)
  }

  const fetchFormFields = async (jobId: string) => {
    const { data } = await supabase
      .from("form_fields")
      .select("*")
      .eq("job_position_id", jobId)
      .order("field_order", { ascending: true })

    if (data) setFormFields(data)
  }

  const handleViewDetails = async (job: JobPosition) => {
    setSelectedJob(job)
    await fetchFormFields(job.id)
    setShowDetails(true)
  }

  const handleDelete = async (jobId: string) => {
    await supabase.from("job_positions").delete().eq("id", jobId)
    setDeleteJobId(null)
    fetchJobs()
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No job positions yet. Create your first job posting to get started.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">{job.description}</CardDescription>
                </div>
                <Badge variant={job.is_active ? "default" : "secondary"}>{job.is_active ? "Active" : "Inactive"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                )}
                {job.employment_type && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.employment_type}
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary_range}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(job)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteJobId(job.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>Job position details and form configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">{selectedJob?.description}</p>
            </div>

            {formFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Application Form Fields ({formFields.length})</h3>
                <div className="space-y-2">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {index + 1}. {field.field_label}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {field.field_type}
                          {field.field_options && ` (${field.field_options.length} options)`}
                        </div>
                      </div>
                      <Badge variant="outline">{field.field_type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job position and all associated applications. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteJobId && handleDelete(deleteJobId)} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
