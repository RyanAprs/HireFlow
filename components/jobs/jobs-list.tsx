"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { JobPosition } from "@/lib/types"
import { MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function JobsList({ userId }: { userId?: string }) {
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  const fetchJobs = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("job_positions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (data) setJobs(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  if (isLoading) {
    return <div className="text-center py-8">Loading job positions...</div>
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500 mb-4">No job positions available at the moment.</p>
          <p className="text-sm text-gray-400">Check back later for new opportunities!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {jobs.map((job) => (
        <Card key={job.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                <CardDescription className="text-base">{job.description}</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">Open</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
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
            <Link href={userId ? `/jobs/${job.id}/apply` : "/auth/login"}>
              <Button className="gap-2">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
