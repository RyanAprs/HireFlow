"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store"
import type { FormFieldType } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DynamicField = {
  field_name: string
  field_type: FormFieldType
  field_label: string
  field_options: string[]
  is_required: boolean
  field_order: number
}

export default function CreateJobPosition() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [salaryRange, setSalaryRange] = useState("")
  const [fields, setFields] = useState<DynamicField[]>([])
  const [error, setError] = useState<string | null>(null)
  const profile = useAuthStore((state) => state.profile)

  const addField = () => {
    setFields([
      ...fields,
      {
        field_name: `field_${fields.length + 1}`,
        field_type: "text",
        field_label: "",
        field_options: [],
        is_required: false,
        field_order: fields.length,
      },
    ])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<DynamicField>) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)))
  }

  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newFields = [...fields]
      ;[newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]]
      setFields(newFields.map((f, i) => ({ ...f, field_order: i })))
    } else if (direction === "down" && index < fields.length - 1) {
      const newFields = [...fields]
      ;[newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]]
      setFields(newFields.map((f, i) => ({ ...f, field_order: i })))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Insert job position
      const { data: jobData, error: jobError } = await supabase
        .from("job_positions")
        .insert({
          title,
          description,
          location: location || null,
          employment_type: employmentType || null,
          salary_range: salaryRange || null,
          created_by: profile?.id,
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Insert form fields
      if (fields.length > 0) {
        const { error: fieldsError } = await supabase.from("form_fields").insert(
          fields.map((field) => ({
            job_position_id: jobData.id,
            ...field,
            field_options: field.field_type === "select" ? field.field_options : null,
          })),
        )

        if (fieldsError) throw fieldsError
      }

      // Reset form
      setTitle("")
      setDescription("")
      setLocation("")
      setEmploymentType("")
      setSalaryRange("")
      setFields([])
      setOpen(false)
      window.location.reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Job Position
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Position</DialogTitle>
          <DialogDescription>Add a new job position with custom application fields</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Remote, New York, NY"
                />
              </div>

              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Input
                  id="employmentType"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  placeholder="e.g., Full-time, Part-time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="e.g., $80,000 - $120,000"
              />
            </div>
          </div>

          {/* Dynamic Fields Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Field {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(index, "down")}
                        disabled={index === fields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeField(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Field Label</Label>
                      <Input
                        value={field.field_label}
                        onChange={(e) => updateField(index, { field_label: e.target.value })}
                        placeholder="e.g., Years of Experience"
                      />
                    </div>

                    <div>
                      <Label>Field Type</Label>
                      <Select
                        value={field.field_type}
                        onValueChange={(value) => updateField(index, { field_type: value as FormFieldType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="tel">Phone</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {field.field_type === "select" && (
                    <div>
                      <Label>Options (comma-separated)</Label>
                      <Input
                        value={field.field_options.join(", ")}
                        onChange={(e) =>
                          updateField(index, {
                            field_options: e.target.value.split(",").map((o) => o.trim()),
                          })
                        }
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={field.is_required}
                      onCheckedChange={(checked) => updateField(index, { is_required: checked as boolean })}
                    />
                    <Label htmlFor={`required-${index}`} className="font-normal cursor-pointer">
                      Required field
                    </Label>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addField} className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Form Field
              </Button>
            </CardContent>
          </Card>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Job Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
