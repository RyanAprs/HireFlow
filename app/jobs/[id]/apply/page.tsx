import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ApplicationForm from "@/components/jobs/application-form"

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get job position
  const { data: job } = await supabase.from("job_positions").select("*").eq("id", id).single()

  if (!job) {
    redirect("/jobs")
  }

  // Get form fields
  const { data: formFields } = await supabase
    .from("form_fields")
    .select("*")
    .eq("job_position_id", id)
    .order("field_order", { ascending: true })

  // Check if already applied
  const { data: existingApp } = await supabase
    .from("applications")
    .select("id")
    .eq("job_position_id", id)
    .eq("applicant_id", user.id)
    .single()

  if (existingApp) {
    redirect("/my-applications")
  }

  return <ApplicationForm job={job} formFields={formFields || []} userId={user.id} />
}
