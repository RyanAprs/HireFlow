"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store";
import type { FormFieldType } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";

type DynamicField = {
  field_name: string;
  field_type: FormFieldType;
  field_label: string;
  field_options: string[];
  is_required: boolean;
  field_order: number;
};

// Minimum required fields that will always be present
const REQUIRED_FIELDS: DynamicField[] = [
  {
    field_name: "full_name",
    field_type: "text",
    field_label: "Full Name",
    field_options: [],
    is_required: true,
    field_order: 0,
  },
  {
    field_name: "email",
    field_type: "email",
    field_label: "Email",
    field_options: [],
    is_required: true,
    field_order: 1,
  },
  {
    field_name: "linkedin",
    field_type: "text",
    field_label: "LinkedIn Profile",
    field_options: [],
    is_required: true,
    field_order: 2,
  },
  {
    field_name: "domicile",
    field_type: "text",
    field_label: "Domicile",
    field_options: [],
    is_required: true,
    field_order: 3,
  },
];

export default function CreateJobPosition() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [additionalFields, setAdditionalFields] = useState<DynamicField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const profile = useAuthStore((state) => state.profile);

  // Generate field_name from field_label
  const generateFieldName = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);
  };

  const addField = () => {
    const newOrder = REQUIRED_FIELDS.length + additionalFields.length;
    setAdditionalFields([
      ...additionalFields,
      {
        field_name: `field_${Date.now()}`,
        field_type: "text",
        field_label: "",
        field_options: [],
        is_required: false,
        field_order: newOrder,
      },
    ]);
  };

  const removeField = (index: number) => {
    setAdditionalFields(additionalFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<DynamicField>) => {
    setAdditionalFields(
      additionalFields.map((field, i) => {
        if (i === index) {
          const updatedField = { ...field, ...updates };

          if (updates.field_label !== undefined && updates.field_label !== "") {
            updatedField.field_name = generateFieldName(updates.field_label);
          }

          return updatedField;
        }
        return field;
      })
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newFields = [...additionalFields];
      [newFields[index - 1], newFields[index]] = [
        newFields[index],
        newFields[index - 1],
      ];
      setAdditionalFields(
        newFields.map((f, i) => ({
          ...f,
          field_order: REQUIRED_FIELDS.length + i,
        }))
      );
    } else if (direction === "down" && index < additionalFields.length - 1) {
      const newFields = [...additionalFields];
      [newFields[index], newFields[index + 1]] = [
        newFields[index + 1],
        newFields[index],
      ];
      setAdditionalFields(
        newFields.map((f, i) => ({
          ...f,
          field_order: REQUIRED_FIELDS.length + i,
        }))
      );
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const invalidFields = additionalFields.filter(
        (f) => !f.field_label.trim()
      );
      if (invalidFields.length > 0) {
        throw new Error("All additional form fields must have a label");
      }

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
        .single();

      if (jobError) throw jobError;

      const allFields = [
        ...REQUIRED_FIELDS.map((f, i) => ({ ...f, field_order: i })),
        ...additionalFields.map((f, i) => ({
          ...f,
          field_order: REQUIRED_FIELDS.length + i,
        })),
      ];

      const { error: fieldsError } = await supabase.from("form_fields").insert(
        allFields.map((field) => ({
          job_position_id: jobData.id,
          field_name: field.field_name,
          field_type: field.field_type,
          field_label: field.field_label,
          field_options:
            field.field_type === "select" ? field.field_options : null,
          is_required: field.is_required,
          field_order: field.field_order,
        }))
      );

      if (fieldsError) throw fieldsError;

      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setEmploymentType("");
      setSalaryRange("");
      setAdditionalFields([]);
      setOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
          <DialogDescription>
            Add a new job position with custom application fields
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Job Info */}
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

          {/* Application Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Required Fields - Read Only */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700">
                  Required Fields (Default)
                </h4>
                <div className="space-y-2">
                  {REQUIRED_FIELDS.map((field, index) => (
                    <div
                      key={field.field_name}
                      className="p-3 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            {index + 1}. {field.field_label}
                            <span className="text-red-500 ml-1">*</span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Required
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Additional Fields - User Defined */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700">
                  Additional Fields (Optional)
                </h4>
                {additionalFields.length > 0 ? (
                  <div className="space-y-4">
                    {additionalFields.map((field, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Field {REQUIRED_FIELDS.length + index + 1}
                          </span>
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
                              disabled={index === additionalFields.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Field Label *</Label>
                            <Input
                              value={field.field_label}
                              onChange={(e) =>
                                updateField(index, {
                                  field_label: e.target.value,
                                })
                              }
                              placeholder="e.g., Years of Experience"
                            />
                            {field.field_label && (
                              <p className="text-xs text-gray-500 mt-1">
                                Field name: {field.field_name}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={field.field_type}
                              onValueChange={(value) =>
                                updateField(index, {
                                  field_type: value as FormFieldType,
                                })
                              }
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
                                <SelectItem value="textarea">
                                  Text Area
                                </SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="file">
                                  File Upload
                                </SelectItem>
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
                                  field_options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim()),
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
                            onCheckedChange={(checked) =>
                              updateField(index, {
                                is_required: checked as boolean,
                              })
                            }
                          />
                          <Label
                            htmlFor={`required-${index}`}
                            className="font-normal cursor-pointer"
                          >
                            Required field
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No additional fields yet. Click below to add custom fields.
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addField}
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Field
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Job Position"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
