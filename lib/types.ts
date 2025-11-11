export type UserRole = "admin" | "applicant"

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type JobPosition = {
  id: string
  title: string
  description: string
  location: string | null
  employment_type: string | null
  salary_range: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type FormFieldType = "text" | "email" | "tel" | "textarea" | "select" | "file" | "date" | "number"

export type FormField = {
  id: string
  job_position_id: string
  field_name: string
  field_type: FormFieldType
  field_label: string
  field_options: string[] | null
  is_required: boolean
  field_order: number
  created_at: string
}

export type ApplicationStatus = "submitted" | "under_review" | "interview" | "accepted" | "rejected"

export type Application = {
  id: string
  job_position_id: string
  applicant_id: string
  status: ApplicationStatus
  profile_photo_url: string | null
  form_data: Record<string, unknown>
  created_at: string
  updated_at: string
}
