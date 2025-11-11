"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Application, JobPosition, Profile } from "@/lib/types";
import { Eye, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ApplicationWithDetails = Application & {
  job_position: JobPosition & { form_fields?: any[] };
  applicant: Profile;
};

export default function ApplicationsList() {
  const supabase = createClient();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>(
    []
  );
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /** 🧩 Fetch logged user and role */
  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setUserRole(profile?.role || "applicant");
  };

  /** 📦 Fetch all applications */
  const fetchApplications = async (role: string, uid: string) => {
    setIsLoading(true);

    const query = supabase
      .from("applications")
      .select(
        `
        *,
        job_position:job_positions!applications_job_position_id_fkey(
          *,
          form_fields:form_fields!form_fields_job_position_id_fkey(*)
        ),
        applicant:profiles!applications_applicant_id_fkey(*)
      `
      )
      .order("created_at", { ascending: false });

    if (role !== "admin") {
      query.eq("applicant_id", uid);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching applications:", error.message);
      setIsLoading(false);
      return;
    }

    setApplications(data as unknown as ApplicationWithDetails[]);
    setIsLoading(false);
  };

  /** 🔐 Helper untuk membuat Signed URL dari path apapun (handle public URL juga) */
  const getSignedFileUrl = async (fileUrl: string) => {
    const bucketName = "application-files";
    let path = fileUrl;

    // 🧠 Jika value berupa full public URL, ambil relative path-nya
    const baseUrl = `https://vaoeqvyaidxkxdcjjbgd.supabase.co/storage/v1/object/public/${bucketName}/`;
    if (fileUrl.startsWith(baseUrl)) {
      path = fileUrl.replace(baseUrl, "");
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, 3600); // 1 jam

    if (error) {
      console.error("❌ Error creating signed URL:", error.message);
      return null;
    }

    return data?.signedUrl;
  };

  /** 🔄 Update status lamaran */
  const updateStatus = async (appId: string, status: string) => {
    await supabase.from("applications").update({ status }).eq("id", appId);
    if (userRole && userId) fetchApplications(userRole, userId);
    if (selectedApp?.id === appId) {
      setSelectedApp({
        ...selectedApp,
        status: status as Application["status"],
      });
    }
  };

  /** 🎨 Status color badge */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userRole && userId) fetchApplications(userRole, userId);
  }, [userRole, userId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            {userRole === "admin"
              ? "No applications have been submitted yet."
              : "You haven't submitted any applications yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* 💼 List of Applications */}
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={app.applicant?.profile_photo_url || undefined}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {userRole === "admin"
                        ? app.applicant.full_name
                        : app.job_position.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {userRole === "admin"
                        ? app.job_position.title
                        : `Applied on ${new Date(
                            app.created_at
                          ).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(app.status)}>
                  {app.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {userRole === "admin" && (
                <div className="flex justify-end gap-2">
                  <Select
                    value={app.status}
                    onValueChange={(value) => updateStatus(app.id, value)}
                  >
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
                      setSelectedApp(app);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📄 Detail Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              {selectedApp?.applicant.full_name} -{" "}
              {selectedApp?.job_position.title}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6 mt-4">
              {/* Applicant Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={selectedApp.applicant?.profile_photo_url || undefined}
                  />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedApp.applicant.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedApp.applicant.email}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Application Responses</h3>
                <div className="space-y-2">
                  {selectedApp.form_data &&
                    Object.entries(selectedApp.form_data).map(
                      ([key, value]) => {
                        const field =
                          selectedApp.job_position?.form_fields?.find(
                            (f) => f.field_name === key
                          );
                        const label = field?.field_label || key;
                        const type = field?.field_type;

                        return (
                          <div
                            key={key}
                            className="p-3 border rounded-lg bg-gray-50 flex flex-col gap-1"
                          >
                            <span className="font-medium text-sm text-gray-700">
                              {label}
                            </span>
                            {type === "file" && value ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const signedUrl = await getSignedFileUrl(
                                    String(value)
                                  );
                                  if (signedUrl)
                                    window.open(signedUrl, "_blank");
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View {label}
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-800">
                                {String(value)}
                              </span>
                            )}
                          </div>
                        );
                      }
                    )}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-2">Update Status</h3>
                <Select
                  value={selectedApp.status}
                  onValueChange={(value) => updateStatus(selectedApp.id, value)}
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
