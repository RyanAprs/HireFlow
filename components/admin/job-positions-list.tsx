"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { JobPosition, FormField } from "@/lib/types";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Eye,
  Trash2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function JobPositionsList() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosition[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const supabase = createClient();

  const fetchJobs = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("job_positions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setJobs(data);
      setFilteredJobs(data);
    }
    setIsLoading(false);
  };

  const fetchFormFields = async (jobId: string) => {
    const { data } = await supabase
      .from("form_fields")
      .select("*")
      .eq("job_position_id", jobId)
      .order("field_order", { ascending: true });

    if (data) setFormFields(data);
  };

  const handleViewDetails = async (job: JobPosition) => {
    setSelectedJob(job);
    await fetchFormFields(job.id);
    setShowDetails(true);
  };

  const handleDelete = async (jobId: string) => {
    await supabase.from("job_positions").delete().eq("id", jobId);
    setDeleteJobId(null);
    fetchJobs();
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...jobs];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => {
        if (statusFilter === "active") return job.is_active;
        if (statusFilter === "inactive") return !job.is_active;
        return true;
      });
    }

    // Filter by keyword (title, description, location, employment_type)
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          job.description.toLowerCase().includes(keyword) ||
          job.location?.toLowerCase().includes(keyword) ||
          job.employment_type?.toLowerCase().includes(keyword)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, searchKeyword, statusFilter, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  return (
    <>
      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title, description, location..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} job
            {jobs.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            {jobs.length === 0
              ? "No job positions yet. Create your first job posting to get started."
              : "No jobs match your search criteria."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </div>
                  <Badge variant={job.is_active ? "default" : "secondary"}>
                    {job.is_active ? "Active" : "Inactive"}
                  </Badge>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                  >
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
      )}

      {/* Job Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Job position details and form configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-gray-600">
                {selectedJob?.description}
              </p>
            </div>

            {formFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Application Form Fields ({formFields.length})
                </h3>
                <div className="space-y-2">
                  {formFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {index + 1}. {field.field_label}
                          {field.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Type: {field.field_type}
                          {field.field_options &&
                            ` (${field.field_options.length} options)`}
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
      <AlertDialog
        open={!!deleteJobId}
        onOpenChange={() => setDeleteJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job position and all associated
              applications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && handleDelete(deleteJobId)}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
