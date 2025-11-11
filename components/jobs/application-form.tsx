"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { JobPosition, FormField } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Upload, X } from "lucide-react";
import Link from "next/link";
import WebcamCapture from "@/components/webcam-capture";

export default function ApplicationForm({
  job,
  formFields,
  userId,
}: {
  job: JobPosition;
  formFields: FormField[];
  userId: string;
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [fileUploads, setFileUploads] = useState<
    Record<string, { file: File; uploading: boolean }>
  >({});
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handlePhotoCapture = (photoUrl: string) => {
    setProfilePhoto(photoUrl);
    setShowWebcam(false);
  };

  const handleFileSelect = async (fieldName: string, file: File) => {
    setFileUploads({ ...fileUploads, [fieldName]: { file, uploading: true } });
    setError(null);

    try {
      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${fieldName}_${Date.now()}.${fileExt}`;
      const filePath = `applications/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("application-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("application-files")
        .getPublicUrl(uploadData.path);

      // Update form data with file URL
      handleInputChange(fieldName, urlData.publicUrl);
      setFileUploads({
        ...fileUploads,
        [fieldName]: { file, uploading: false },
      });
    } catch (err) {
      console.error("File upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
      setFileUploads((prev) => {
        const newUploads = { ...prev };
        delete newUploads[fieldName];
        return newUploads;
      });
    }
  };

  const removeFile = (fieldName: string) => {
    setFileUploads((prev) => {
      const newUploads = { ...prev };
      delete newUploads[fieldName];
      return newUploads;
    });
    setFormData((prev) => {
      const newData = { ...prev };
      delete newData[fieldName];
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if any files are still uploading
    const stillUploading = Object.values(fileUploads).some(
      (upload) => upload.uploading
    );
    if (stillUploading) {
      setError("Please wait for all files to finish uploading");
      setIsLoading(false);
      return;
    }

    // Validate required fields
    for (const field of formFields) {
      if (field.is_required && !formData[field.field_name]) {
        setError(`Please fill in the required field: ${field.field_label}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const { error: appError } = await supabase.from("applications").insert({
        job_position_id: job.id,
        applicant_id: userId,
        form_data: formData,
        profile_photo_url: profilePhoto,
        status: "submitted",
      });

      if (appError) throw appError;

      router.push("/my-applications?success=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.field_name,
      required: field.is_required,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleInputChange(field.field_name, e.target.value),
    };

    switch (field.field_type) {
      case "textarea":
        return <Textarea {...commonProps} rows={4} />;
      case "select":
        return (
          <Select
            required={field.is_required}
            onValueChange={(value) =>
              handleInputChange(field.field_name, value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "file":
        const currentUpload = fileUploads[field.field_name];
        const hasFile = currentUpload || formData[field.field_name];

        return (
          <div className="space-y-2">
            {hasFile ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                {currentUpload?.uploading ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse text-blue-500" />
                    <span className="text-sm text-gray-600 flex-1">
                      Uploading {currentUpload.file.name}...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600 flex-1">
                      {currentUpload?.file.name || "File uploaded successfully"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(field.field_name)}
                      disabled={currentUpload?.uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <Input
                type="file"
                id={field.field_name}
                required={field.is_required}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(field.field_name, file);
                  }
                }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            )}
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
            </p>
          </div>
        );
      default:
        return <Input {...commonProps} type={field.field_type} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply for {job.title}</CardTitle>
            <CardDescription>
              Fill out the application form below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div>
                <Label>Profile Photo (Optional)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {profilePhoto ? (
                    <div className="relative">
                      <img
                        src={profilePhoto || "/placeholder.svg"}
                        alt="Profile"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => setShowWebcam(true)}
                      >
                        Retake Photo
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWebcam(true)}
                      className="gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo with Webcam
                    </Button>
                  )}
                </div>
              </div>

              {/* Dynamic Form Fields */}
              {formFields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={field.field_name}>
                    {field.field_label}
                    {field.is_required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <div className="mt-2">{renderField(field)}</div>
                </div>
              ))}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-4">
                <Link href="/jobs" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    Object.values(fileUploads).some((u) => u.uploading)
                  }
                  className="flex-1"
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Webcam Modal */}
      {showWebcam && (
        <WebcamCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
}
